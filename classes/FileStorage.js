const Downloader = require('nodejs-file-downloader');
const fs = require('fs');
const Device = require('./Device');
const mime = require('mime-types');
const usb = require('usb');

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
    const onDevice = (interval) => (

        setTimeout(() => {

            drives().then(drives => {
                console.log(`Got ${drives.length} drives`)
                out(drives)
            }).catch(e => {
                console.error(e)
            })
            
        }, interval)

    )

    usb.on('attach', () => onDevice(5000))
    usb.on('detach', () => onDevice(0))
    const kill = () => {
        usb.removeListener('attach', onDevice)
        usb.removeListener('detach', onDevice)
    }
    return {
        kill,
        init: () => onDevice()
    }
}

const drives = () => Device.exec(`lsblk -o name,mountpoint,label,size,fstype,serial,path,fsused --json -b | base64`)
    .then(base64 => Buffer.from(base64, 'base64').toString())
    .then(JSON.parse)
    .then(result => result.blockdevices)
    .then(result => result.map(item => {
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
    await Device.exec(`mkdir -p /portal3/mnt${drive}`)
    await Device.exec(`mount ${drive} /portal3/mnt${drive}`)
    return true;
}

const unmount = async (drive) => {
    await Device.exec(`umount ${drive}`)
    return true;
}

const rename = async (drive, name) => {
    await Device.exec(`e2label ${drive} "${name}"`)
    return true;
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
    streamDrives
}