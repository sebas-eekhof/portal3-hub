const Downloader = require('nodejs-file-downloader');
const fs = require('fs');
const drivelist = require('drivelist');
const checkDiskSpace = require('check-disk-space');
const Device = require('./Device');
const mime = require('mime-types');

const downloadFile = async (url, fileName) => {
    const downloader = new Downloader({
        url,
        directory: '/portal3/tmp',
        fileName
    })
    await downloader.download();
    return `/portal3/tmp/${fileName}`
}

const rawDrives = () => drivelist.list();

const mount = async (drive) => {
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

const formatDrive = async (drive) => {
    if(!drive.includes('/dev/s'))
        throw new Error('Can\'t format this drive')
    await unmount(drive)
    await Device.exec(`mkfs.ext4 -F ${drive}`)
    await rename(drive, 'USB')
    await mount(drive);
    return true;
}

const drives = async () => {
    const list = await drivelist.list();
    let drives = [];
    for(let i = 0; i < list.length; i++) {
        data = {
            device: list[i].device,
            fs: list[i].partitionTableType,
            is_system: false
        }
        let mountpoints = [];
        for(let i2 = 0; i2 < list[i].mountpoints.length; i2++) {
            const check_storage = await checkDiskSpace(list[i].mountpoints[i2].path)
            if(list[i].mountpoints[i2].path === '/') {
                data.is_system = true;
                mountpoints = [
                    {
                        name: 'Hub',
                        path: '/portal3/storage',
                        storage: {
                            total: check_storage.size,
                            free: check_storage.free
                        }
                    }
                ];
            }
            if(!data.is_system) {
                mountpoints.push({
                    name: list[i].mountpoints[i2].label,
                    path: list[i].mountpoints[i2].path,
                    storage: {
                        total: check_storage.size,
                        free: check_storage.free
                    }
                })
            }
        }
        data.mountpoints = mountpoints;
        drives.push(data)
    }
    return drives;
};

const mountpoints = async () => {
    const drv = await drives();
    let mountpoints = [];
    drv.map(drive => {
        mountpoints.push(...drive.mountpoints.map(mountpoint => {
            return {
                ...mountpoint,
                drive
            }
        }))
    })
    return mountpoints;
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

const getByUsb = async (usb_device) => {
    let hwinfo = await Device.exec('hwinfo --disk');
    hwinfo = hwinfo.split('\n\n');
    console.log(usb_device.vendor_id.toString(16))
    for(let i = 0; i < hwinfo.length; i++) {
        let dev = true;
        if(usb_device.vendor_id && !hwinfo[i].includes(`Vendor: usb 0x${usb_device.vendor_id.toString(16)}`))
            dev = false;
        if(usb_device.product_id && !hwinfo[i].includes(`Device: usb 0x${usb_device.product_id.toString(16)}`))
            dev = false;
        if(usb_device.serial_number && usb_device.serial_number.length !== 0 && !hwinfo[i].includes(`Serial ID: "${usb_device.serial_number}"`))
            dev = false;
        if(dev) {
            const device = hwinfo[i].split('\n')
            for(let i = 0; i < device.length; i++) {
                if(device[i].includes('Device Files')) {

                }
            }
        }
    }
}

const removeFile = (path) => {
    fs.unlinkSync(path)
    return true;
}

module.exports = {
    downloadFile,
    removeFile,
    drives,
    mountpoints,
    getByUsb,
    rawDrives,
    readDir,
    formatDrive
}