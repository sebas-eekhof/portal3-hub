const Downloader = require('nodejs-file-downloader');
const fs = require('fs');
const drivelist = require('drivelist');

const downloadFile = async (url, fileName) => {
    const downloader = new Downloader({
        url,
        directory: '/portal3/tmp',
        fileName
    })
    await downloader.download();
    return `/portal3/tmp/${fileName}`
}

const drives = () => drivelist.list();

const removeFile = (path) => {
    fs.unlinkSync(path)
    return true;
}

module.exports = {
    downloadFile,
    removeFile,
    drives
}