const Downloader = require('nodejs-file-downloader');
const fs = require('fs');
const Device = require('./Device');
const mime = require('mime-types');
const { EventEmitter } = require('events');
const _ = require('lodash');

let mount_wait = {};

const StorageEmitter = new EventEmitter();

const downloadFile = async (url, fileName) => {
    const downloader = new Downloader({
        url,
        directory: '/portal3/tmp',
        fileName
    })
    await downloader.download();
    return `/portal3/tmp/${fileName}`
}

const streamDrives = (out) => {
    const onData = (drives) => {out(drives)}
    StorageEmitter.on('drives', onData)
    return {
        kill: () => StorageEmitter.removeListener('drives', onData),
        init: async () => out(await getDrives())
    }
}

const getDrive = (drive) => Device.exec(`lsblk ${drive} -o name,mountpoint,label,size,fstype,serial,path,fsused,fsavail,fssize,fsuse% --json -b | base64`)
    .then(base64 => Buffer.from(base64, 'base64').toString())
    .then(JSON.parse)
    .then(result => result.blockdevices)
    .then(result => result.reverse().map(item => {
        const is_system = !item.path.includes('/dev/sd');
        if(is_system) {
            item.name = 'Intern';
            let points = [];
            for(let i = 0; i < item.children.length; i++) {
                if(item.children[i].mountpoint === '/') {
                    let child = item.children[i];
                    child.label = 'Opslag';
                    points.push(child)
                }
            }
            item.children = points;
        }
        return {
            is_system,
            ...item
        }
    }))
    .then(result => {
        if(typeof result[0] === 'undefined')
            throw new Error(`Drive "${drive}" does not exists`)
        else
            return result[0]
    })

const getDrives = () => Device.exec(`lsblk -o name,mountpoint,label,size,fstype,serial,path,fsused,fsavail,fssize,fsuse% --json -b | base64`)
    .then(base64 => Buffer.from(base64, 'base64').toString())
    .then(JSON.parse)
    .then(result => result.blockdevices)
    .then(result => result.reverse().map(item => {
        const is_system = !item.path.includes('/dev/sd');
        if(is_system) {
            item.name = 'Intern';
            let points = [];
            for(let i = 0; i < item.children.length; i++) {
                if(item.children[i].mountpoint === '/') {
                    let child = item.children[i];
                    child.label = 'Opslag';
                    points.push(child)
                }
            }
            item.children = points;
        }
        return {
            is_system,
            ...item
        }
    }))

const mount = async (drive) => {
    await Device.exec(`mkdir -p /portal3/mnt/${drive.substr(1).replace('/', '_')}`)
    await Device.exec(`mount ${drive} /portal3/mnt/${drive.substr(1).replace('/', '_')}`)
    return true;
}

const disk_utils = {
    rename: {
        exfat: (drive, name) => `exfatlabel ${drive} "${name}"`,
        fat32: (drive, name) => `fatlabel ${drive} "${name}"`,
        ntfs: (drive, name) => `ntfslabel ${drive} "${name}"`,
        ext2: (drive, name) => `e2label ${drive} "${name}"`,
        ext3: (drive, name) => `e2label ${drive} "${name}"`,
        ext4: (drive, name) => `e2label ${drive} "${name}"`,
        btrfs: (drive, name) => `btrfs filesystem label ${drive} "${name}"`,
        swap: (drive, name) => `swaplabel -L "${name}" ${drive}`,
    }
}

const unmount = async (mountpoint) => {
    await Device.exec(`umount ${mountpoint}`)
    await Device.exec(`rm -rf ${mountpoint}`)
    return true;
}

const unmountAll = async () => {
    await Device.exec(`umount /portal3/mnt/*`);
    await Device.exec(`rm -rf /portal3/mnt/*`);
    return true;
}

const rename = async (drive, name) => {
    drive = await getDrive(drive)
    if(!drive.fstype)
        throw new Error('Drive needs to be formatted')
    const util = _.get(disk_utils.rename, drive.fstype.toLowerCase(), false)
    if(!util)
        throw new Error(`Filesystem "${drive.fstype}" not supported`)
    mount_wait[drive.path] = 'Renaming';
    if(drive.mountpoint)
        await unmount(drive.mountpoint)
    await Device.exec(util(drive.path, name))
    await mount(drive.path);
    delete mount_wait[drive.path];
    return true;
}

let old_drives = [];

const startAutoMount = () => {
    let last_hash = null;
    const checkHash = async () => {
        const hash = await Device.exec(`lsblk -o uuid,name,fsavail,fssize,fstype,fsused,label,pttype | base64`)
        if(last_hash !== hash) {
            last_hash = hash;

            const drive_list = await getDrives();

            old_drives.map(async (old_drive) => {
                if(!old_drive.is_system) {
                    let found = false;
                    for(let i = 0; i < drive_list.length; i++)
                        if(drive_list[i].name === old_drive.name)
                            found = true;
                    if(!found)
                        if(old_drive.children)
                            for(let i = 0; i < old_drive.children.length; i++)
                                if(old_drive.children[i].mountpoint)
                                    await unmount(old_drive.children[i].mountpoint)
                }
            })

            old_drives = drive_list;

            drive_list.map(async (drive) => {
                if(!drive.is_system) {
                    for(let i = 0; i < drive.children ? drive.children.length : 0; i++)
                        if(drive.children[i].mountpoint === null)
                            if(_.get(mount_wait, drive.children[i].path, false) === false)
                                await mount(drive.children[i].path)
                }
            })

            StorageEmitter.emit('drives', drive_list)
            setTimeout(checkHash, 200);
        } else {
            setTimeout(checkHash, 200);
        }
    }
    checkHash()
}

const streamFormatDrive = (out, { drive, name = 'usb', fstype = 'exfat', quick = true }) => {
    if(!drive.includes('/dev/s'))
        throw new Error('Can\'t format this drive')

    const start = async () => {
        out({done: false, msg: 'Gegevens verzamelen'});
        drive = await getDrive(drive);

        out({done: false, msg: 'Ontkoppelen'});
        let points = [];
        points.push(drive.path)
        
        mount_wait[drive.path] = 'Formatting';
        if(drive.mountpoint)
            await unmount(drive)
        for(let i = 0; i < _.get(drive, 'children', []).length; i++) {
            points.push(drive.children[i].path);
            mount_wait[drive.children[i].path] = 'Formatting';
            if(drive.children[i].mountpoint)
                await unmount(drive.children[i].path)
        }

        out({done: false, msg: 'Bestandssysteem verwijderen'});
        await Device.exec(`wipefs -a ${drive.path}`)

        out({done: false, msg: 'Data verwijderen'});
        const size = (quick ? 20000000 : drive.size);
        await Device.exec(`dd if=/dev/zero of=${drive.path} count=1 bs=${size} status=progress`)


        out({done: false, msg: 'Partities inrichten'});
        await Device.exec(`echo 'type=83' | sudo sfdisk ${drive.path} --force`)

        out({done: false, msg: 'Gegevens verzamelen'});
        drive = await getDrive(drive.path);

        out({done: false, msg: 'Nieuw bestandssysteem schrijven'});
        await Device.exec(`mkfs -t ${fstype} ${_.get(drive, 'children[0].path', null)}`)

        out({done: false, msg: 'Naam wijzigen'});
        const util = _.get(disk_utils.rename, fstype, false)
        if(util)
            await Device.exec(util(_.get(drive, 'children[0].path', null), name))

        out({done: false, msg: 'Afronden'});
        await mount(_.get(drive, 'children[0].path', null))
        for(let i = 0; i < points.length; i++)
            delete mount_wait[points[i]];
            
        out({done: true, msg: 'Klaar'});
    }

    return {
        init: start
    }
}

const readDir = async (path) => {
    return fs.readdirSync(path).map(name => {
        let type;
        if(fs.lstatSync(`${path}/${name}`).isDirectory())
            type = 'dir';
        else
            type = mime.lookup(`${path}/${name}`);
        if(!type)
            type = 'file';
        return {
            name,
            type
        }
    })
}

const removeFile = (path) => {
    fs.unlinkSync(path)
    return true;
}

module.exports = {
    downloadFile,
    removeFile,
    getDrives,
    getDrive,
    readDir,
    streamDrives,
    startAutoMount,
    unmountAll,
    unmount,
    mount,
    rename,
    streamFormatDrive
}