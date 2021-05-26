const _ = require('lodash');
const Device = require('./Device');

const vendorBlackList = [
    7531,
    8457
];

const getDevices = async () => {
    const devices = await Device.exec('lsusb');
    console.log(devices)
    console.log('done')
}

module.exports = {
    getDevices
}