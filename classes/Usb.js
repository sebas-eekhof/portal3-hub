const usb = require('usb');
const _ = require('lodash');
const { DeviceClasses } = require('./Usb/Descriptor');

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
    const interfaces = device.interfaces;
    const descriptor = device.deviceDescriptor;

    let device_info = {}
    
    if(descriptor.bDeviceClass === 0 && _.get(interfaces, '[0]', false)) {
        console.log(`I gonna use the interface`, `[${interfaces[0].descriptor.bDeviceClass}][${interfaces[0].descriptor.bDeviceSubClass}][${interfaces[0].descriptor.bDeviceProtocol}]`)
        device_info = {
            class: _.get(DeviceClasses, `[${interfaces[0].descriptor.bDeviceClass}]`, null),
            subclass: _.get(DeviceClasses, `[${interfaces[0].descriptor.bDeviceClass}][${interfaces[0].descriptor.bDeviceSubClass}]`, null),
            protocol: _.get(DeviceClasses, `[${interfaces[0].descriptor.bDeviceClass}][${interfaces[0].descriptor.bDeviceSubClass}][${interfaces[0].descriptor.bDeviceProtocol}]`, null),
        }
    } else {
        device_info = {
            class: _.get(DeviceClasses, `[${descriptor.bDeviceClass}]`, null),
            subclass: _.get(DeviceClasses, `[${descriptor.bDeviceClass}][${descriptor.bDeviceSubClass}]`, null),
            protocol: _.get(DeviceClasses, `[${descriptor.bDeviceClass}][${descriptor.bDeviceSubClass}][${descriptor.bDeviceProtocol}]`, null),
        }
    }

    const data = {
        name: await getStringDescriptor(device, descriptor.iProduct),
        manufacturer: await getStringDescriptor(device, descriptor.iManufacturer),
        serial_number: await getStringDescriptor(device, descriptor.iSerialNumber),
        device_info
    }
    device.close();
    return data;
}

const getDevices = async () => {
    const devices = doBlacklist(usb.getDeviceList());
    const test_device = devices[0];
    console.log(await getDeviceInfo(test_device))
    return true;
};

module.exports = {
    getDevices
}