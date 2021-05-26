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
        device_info = {
            class: _.get(DeviceClasses.interface, `[${interfaces[0].descriptor.bInterfaceClass}].name`, null),
            subclass: _.get(DeviceClasses.interface, `[${interfaces[0].descriptor.bInterfaceClass}][${interfaces[0].descriptor.bInterfaceSubClass}].name`, null),
            protocol: _.get(DeviceClasses.interface, `[${interfaces[0].descriptor.bInterfaceClass}][${interfaces[0].descriptor.bInterfaceSubClass}][${interfaces[0].descriptor.bInterfaceProtocol}].name`, null),
        }
    } else {
        device_info = {
            class: _.get(DeviceClasses.device, `[${descriptor.bDeviceClass}].name`, null),
            subclass: _.get(DeviceClasses.device, `[${descriptor.bDeviceClass}][${descriptor.bDeviceSubClass}].name`, null),
            protocol: _.get(DeviceClasses.device, `[${descriptor.bDeviceClass}][${descriptor.bDeviceSubClass}][${descriptor.bDeviceProtocol}].name`, null),
        }
    }

    let keys = [0, 1, 2, 3, 4, 5];
    let random_str = {};
    for(let i = 0; i < keys.length; i++)
        random_str[i] = await getStringDescriptor(device, keys[i])

    const data = {
        name: await getStringDescriptor(device, descriptor.iProduct),
        manufacturer: await getStringDescriptor(device, descriptor.iManufacturer),
        serial_number: await getStringDescriptor(device, descriptor.iSerialNumber),
        device_info,
        random_str
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