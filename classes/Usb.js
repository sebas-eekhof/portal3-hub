const _ = require('lodash');
const Device = require('./Device');

const vendorBlackList = [
    7531,
    8457
];

const getDevices = async () => {
    console.log('_____START_LSUSB_____')
    const devices = await Device.exec('lsusb -v');
    console.log(devices)
    console.log('_____END_LSUSB_____')
    return true
}

module.exports = {
    getDevices
}