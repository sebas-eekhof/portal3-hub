const usb = require('usb');
const _ = require('lodash');

const vendorBlackList = [
    7531,
    8457
];

const getStringDescriptor = (device, index) => new Promise((resolve, reject) => device.getStringDescriptor(index, (err, resp) => (err) ? reject(err) : resolve(resp)));

/**
 * 
 * @param {*} devices 
 * @returns {usb.Device[]}
 */
const doBlacklist = (devices) => devices.filter(device => !(vendorBlackList.includes(_.get(device, 'deviceDescriptor.idVendor', 0))));

/**
 * 
 * @param {usb.Device} device 
 */
const getDeviceInfo = async (device) => {
    device.open();
    const descriptor = device.deviceDescriptor;
    return {
        name: await getStringDescriptor(device, descriptor.iProduct),
        manufacturer: await getStringDescriptor(device, descriptor.iManufacturer),
        serial_number: await getStringDescriptor(device, descriptor.iSerialNumber)
    }
}

const getDevices = async () => {
    const devices = doBlacklist(usb.getDeviceList());
    const test_device = devices[0];
    // test_device.open()
    console.log(test_device.deviceDescriptor)
    console.log(await getDeviceInfo(test_device))
    return true;
};

module.exports = {
    getDevices
}