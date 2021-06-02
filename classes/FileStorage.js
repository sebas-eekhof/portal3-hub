const Downloader = require('nodejs-file-downloader');
const fs = require('fs');
const Device = require('./Device');
const mime = require('mime-types');
const { EventEmitter } = require('events');

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
        init: async () => out(await drives())
    }
}

const drives = () => Device.exec(`lsblk -o name,mountpoint,label,size,fstype,serial,path,fsused,fsavail,fssize,fsuse% --json -b | base64`)
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
    await Device.exec(`e2label ${drive} "${name}"`)
    return true;
}

let old_drives = [];

const startAutoMount = () => {
    let last_hash = null;
    const checkHash = async () => {
        const hash = await Device.exec(`lsblk -o uuid,name,fsavail,fssize,fstype,fsused,label,pttype | base64`)
        if(last_hash !== hash) {
            last_hash = hash;

            const drive_list = await drives();

            old_drives.map(async (old_drive) => {
                if(!old_drive.is_system) {
                    let found = false;
                    for(let i = 0; i < drive_list.length; i++)
                        if(drive_list[i].name === old_drive.name)
                            found = true;
                    if(!found)
                        for(let i = 0; i < old_drive.children.length; i++)
                            if(old_drive.children[i].mountpoint)
                                await unmount(old_drive.children[i].mountpoint)
                }
            })

            old_drives = drive_list;

            drive_list.map(async (drive) => {
                if(!drive.is_system) {
                    for(let i = 0; i < drive.children.length; i++)
                        if(drive.children[i].mountpoint === null)
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

// const formatDrive = async (drive) => {
//     if(!drive.includes('/dev/s'))
//         throw new Error('Can\'t format this drive')
//     await unmount(drive)
//     await Device.exec(`mkfs.ext4 -F ${drive}`)
//     await rename(drive, 'USB')
//     await mount(drive);
//     return true;
// }

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
    drives,
    readDir,
    streamDrives,
    startAutoMount,
    unmountAll,
    unmount,
    mount
}