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
    const device_info_str = _.get(interfaces, '[0].descriptor.iInterface', false) ? await getStringDescriptor(device, interfaces[0].descriptor.iInterface) : null;
    const data = {
        name: await getStringDescriptor(device, descriptor.iProduct),
        manufacturer: await getStringDescriptor(device, descriptor.iManufacturer),
        serial_number: await getStringDescriptor(device, descriptor.iSerialNumber),
        vendor_id: descriptor.idVendor,
        product_id: descriptor.idProduct,
        device_info,
        device_info_str
    }
    device.close();
    return data;
}

const getDevices = async () => {
    const devices = doBlacklist(usb.getDeviceList());
    let device_infos = [];
    for(let i = 0; i < devices.length; i++)
        device_infos.push(await getDeviceInfo(devices[i]))
    console.log(device_infos)
    return true;
};

module.exports = {
    getDevices
}