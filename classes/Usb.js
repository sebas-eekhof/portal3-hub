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
 * @param {*} args 
 * @param {String} args.device_name
 * @returns 
 */
const specialDeviceFilters = ({device_info, device_name, vendor_id, product_id}) => {
    if(device_info.class !== 255)
        return device_info;
    if(device_name.toLowerCase().includes('wlan'))
        device_info.class = DeviceClasses.interface[14];
    return device_info;
}

/**
 * 
 * @param {usb.Device} device 
 */
const getDeviceInfo = async (device) => {
    device.open();
    const interfaces = device.interfaces;
    const descriptor = device.deviceDescriptor;
    const device_name = (descriptor.iProduct !== 0) ? await getStringDescriptor(device, descriptor.iProduct) : null;
    const vendor_id = descriptor.idVendor;
    const product_id = descriptor.idProduct;

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

    device_info = specialDeviceFilters({device_info, device_name, vendor_id, product_id});

    const device_info_str = _.get(interfaces, '[0].descriptor.iInterface', false) ? await getStringDescriptor(device, interfaces[0].descriptor.iInterface) : null;
    const data = {
        name: device_name,
        manufacturer: (descriptor.iManufacturer !== 0) ? await getStringDescriptor(device, descriptor.iManufacturer) : null,
        serial_number: (descriptor.iSerialNumber !== 0) ? await getStringDescriptor(device, descriptor.iSerialNumber) : null,
        vendor_id,
        product_id,
        device_info,
        device_info_str,
        port: device.portNumbers[1],
        using_hub: (device.portNumbers.length > 2)
    }
    device.close();
    return data;
}

const getDevices = async () => {
    const devices = doBlacklist(usb.getDeviceList());
    let device_infos = [];
    for(let i = 0; i < devices.length; i++)
        device_infos.push(await getDeviceInfo(devices[i]))
    return device_infos;
};

module.exports = {
    getDevices
}