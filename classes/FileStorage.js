const Downloader = require('nodejs-file-downloader');
const fs = require('fs');
const drivelist = require('drivelist');
const checkDiskSpace = require('check-disk-space')

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

const getByUsb = async () => {
    let hwinfo = await Device.exec('hwinfo --disk');
    hwinfo = hwinfo.split('\n\n');
    for(let i = 0; i < hwinfo.length; i++) {
        const device = hwinfo.split('\n')
        console.log(device)
        process.exit();
    }
    console.log(hwinfo)
}

const removeFile = (path) => {
    fs.unlinkSync(path)
    return true;
}

module.exports = {
    downloadFile,
    removeFile,
    drives,
    getByUsb,
    rawDrives
}