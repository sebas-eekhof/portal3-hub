const usb = require('usb');
const _ = require('lodash');

const vendorBlackList = [
    7531,
    8457
];

const doBlacklist = (devices) => devices.filter(device => !(vendorBlackList.includes(_.get(device, 'deviceDescriptor.idVendor', 0))));

const getDevices = () => usb.getDeviceList().then(doBlacklist);

module.exports = {
    getDevices
}