const _ = require('lodash');
const Device = require('./Device');
const { spawn } = require('child_process');

const vendorBlackList = [
    7531,
    8457
];

const getDevices = async () => {
    console.log('_____START_LSUSB_____')
    const devices = await Device.exec('lsusb');
    console.log(devices)
    console.log('_____END_LSUSB_____')
    return true
}

module.exports = {
    getDevices
}