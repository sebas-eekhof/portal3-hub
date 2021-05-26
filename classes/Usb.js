const usb = require('usb');
const _ = require('lodash');

const vendorBlackList = [
    7531,
    8457
];

/**
 * 
 * @param {*} devices 
 * @returns {usb.Device[]}
 */
const doBlacklist = (devices) => devices.filter(device => !(vendorBlackList.includes(_.get(device, 'deviceDescriptor.idVendor', 0))));

const getDevices = async () => {
    const devices = doBlacklist(usb.getDeviceList());
    const test_device = devices[0];
    // test_device.open()
    const capabilities = await new Promise((resolve, reject) => test_device.getBosDescriptor((err, resp) => (err) ? reject(err) : resolve(resp)));
    console.log(capabilities)
    return true;
};

module.exports = {
    getDevices
}