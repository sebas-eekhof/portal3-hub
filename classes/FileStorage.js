const Downloader = require('nodejs-file-downloader');
const fs = require('fs');
const Device = require('./Device');
const mime = require('mime-types');
const { EventEmitter } = require('events');
const _ = require('lodash');
const Crypto = require('./Crypto');
const fastFolderSize = require('fast-folder-size');

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

const streamDrives = ({out}) => {
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
                    child.mountpoint = '/portal3/storage';
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
    },
    format: {
        exfat: (drive) => `mkfs.exfat -F "${drive}"`,
        fat32: (drive) => `mkdosfs "${drive}"`,
        ntfs: (drive) => `mkntfs -F -f "${drive}"`,
        ext2: (drive) => `mkfs.ext2 -F -q "${drive}"`,
        ext3: (drive) => `mkfs.ext3 -F -q "${drive}"`,
        ext4: (drive) => `mkfs.ext4 -F -q "${drive}"`,
        btrfs: (drive) => `mkfs.btrfs -f -q "${drive}"`
    }
}

const unmount = async (mountpoint) => {
    await Device.exec(`umount -f -l ${mountpoint}`)
    await Device.exec(`rm -rf ${mountpoint}`)
    return true;
}

const unmountAll = async () => {
    const dir = fs.readdirSync('/portal3/mnt');
    if(!dir.length)
        return true;
    try {
        await Device.exec(`umount -f -l /portal3/mnt/*`);
    } catch(e) {}
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
                            for(let i = 0; i < (old_drive.children ? old_drive.children.length : 0); i++)
                                if(old_drive.children[i].mountpoint)
                                    try { await unmount(old_drive.children[i].mountpoint) } catch(e) {}
                }
            })

            old_drives = drive_list;

            drive_list.map(async (drive) => {
                if(!drive.is_system)
                    for(let i = 0; i < (drive.children ? drive.children.length : 0); i++)
                        if(drive.children[i].mountpoint === null)
                            if(_.get(mount_wait, `drive.children[${i}].path`, false) === false && _.get(mount_wait, `drive.drive.path`, false) === false)
                                try { await mount(drive.children[i].path) } catch(e) {}
            })

            StorageEmitter.emit('drives', drive_list)
            setTimeout(checkHash, 200);
        } else {
            setTimeout(checkHash, 200);
        }
    }
    checkHash()
}

const streamExplorer = ({out, onError, kill}) => {

    const navigateCommand = (command) => {
        switch(command.cmd) {
            case 'dir':
                readDir(command.dir, true).then(dir => out({cmd: 'dir', dir})).catch(onError)
            break;
        }
    }

    return {
        in: navigateCommand
    }
}

const streamFormatDrive = async ({out, onError, kill}, { drive, name = 'usb', fstype = 'exfat', quick = true }) => {
    if(!drive.includes('/dev/s'))
        throw new Error('Can\'t format this drive')
    
    if(typeof disk_utils.format[fstype] === 'undefined')
        throw new Error(`Can't format drive as ${fstype}`)

    const start = async () => {
        try {
            const total_steps = 10;
            let step = 1;
            out({done: false, msg: 'Gegevens verzamelen', step, total_steps});
            drive = await getDrive(drive);
            step++;
            out({done: false, msg: 'Ontkoppelen', step, total_steps});
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

            step++;
            out({done: false, msg: 'Bestandssysteem verwijderen', step, total_steps});
            await Device.exec(`wipefs -a ${drive.path} --force`)

            step++;
            out({done: false, msg: 'Data verwijderen', step, total_steps});
            const size = (quick ? 20000000 : drive.size);
            await Device.exec(`dd if=/dev/zero of=${drive.path} count=1 bs=${size} status=progress`)

            step++;
            out({done: false, msg: 'Partities inrichten', step, total_steps});
            await Device.exec(`echo 'type=83' | sudo sfdisk ${drive.path} --force`)

            step++;
            out({done: false, msg: 'Gegevens verzamelen', step, total_steps});
            drive = await getDrive(drive.path);

            step++;
            out({done: false, msg: 'Nieuw bestandssysteem schrijven', step, total_steps});
            await Device.exec(disk_utils.format[fstype](drive.children[0].path))

            step++;
            out({done: false, msg: 'Naam wijzigen', step, total_steps});
            const util = _.get(disk_utils.rename, fstype, false)
            if(util)
                await Device.exec(util(_.get(drive, 'children[0].path', null), name))

            step++;
            out({done: false, msg: 'Afronden', step, total_steps});
            await mount(_.get(drive, 'children[0].path', null))
            for(let i = 0; i < points.length; i++)
                delete mount_wait[points[i]];
               
            step++; 
            out({done: true, msg: 'Klaar', step, total_steps});

            kill();
        } catch(e) {
            onError(e)
        }
    }

    return {
        init: start
    }
}

const readDir = async (path, with_stats = false) => {
    const dir = fs.readdirSync(path);
    let ret_total = [];
    for(let i = 0; i < dir.length; i++) {
        const name = dir[i];

        let type;
        if(fs.lstatSync(`${path}/${name}`).isDirectory())
            type = 'folder';
        else
            type = mime.lookup(`${path}/${name}`);
        if(!type)
            type = 'file';

        let ret = {
            name,
            type
        };
        if(with_stats) {
            const stats = fs.statSync(`${path}/${name}`);
            if(type === 'folder')
                stats.size = await new Promise(resolve => fastFolderSize(`${path}/${name}`, (err, bytes) => { if(err) resolve(0); else resolve(bytes); }))
            ret.stats = stats;
        }

        ret_total.push(ret)

    }
    return ret_total;
}

const encryptFiles = async (paths) => {
    for(let i = 0; i < paths.length; i++) {
        if(!fs.existsSync(paths[i]))
            throw new Error('File does not exists');
        await Crypto.EncryptFile(paths[i])
    }
    return true;
}

const decryptFiles = async (paths) => {
    for(let i = 0; i < paths.length; i++) {
        if(!fs.existsSync(paths[i]))
            throw new Error('File does not exists');
        await Crypto.DecryptFile(paths[i], `${paths[i]}.enc`)
    }
    return true;
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
    streamFormatDrive,
    streamExplorer,
    encryptFiles,
    decryptFiles
}