const _ = require('lodash');
const Device = require('./Device');

const vendorBlackList = [
    7531,
    8457
];

const getDevices = async () => {
    const Devices = await Device.exec('lsusb');
}

module.exports = {
    getDevices
}