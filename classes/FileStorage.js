const Downloader = require('nodejs-file-downloader');
const fs = require('fs');

const downloadFile = (url, fileName) => {
    const downloader = new Downloader({
        url,
        directory: '/portal3/tmp',
        fileName
    })
    await downloader.download();
    return `/portal3/tmp/${fileName}`
}

const removeFile = (path) => {
    fs.unlinkSync(`file://${path}`)
    return true;
}

module.exports = {
    downloadFile,
    removeFile
}