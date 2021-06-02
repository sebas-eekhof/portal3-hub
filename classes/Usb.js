const usb = require('usb');
const _ = require('lodash');
const { DeviceClasses } = require('./Usb/Descriptor');
const Device = require('./Device');

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
    if(device_name.toLowerCase().includes('wlan'))
        device_info.class_id = 14;
    if(vendor_id === 1008 && device_name.toLowerCase().includes('jet'))
        device_info.class_id = 7;
    return {
        class: _.get(DeviceClasses[device_info.type], `[${device_info.class_id}].name`, DeviceClasses[device_info.type][0]),
        subclass: _.get(DeviceClasses[device_info.type], `[${device_info.class_id}].subclasses[${device_info.subclass_id}].name`, null),
        protocol: _.get(DeviceClasses[device_info.type], `[${device_info.class_id}].subclasses[${device_info.product_id}].protocols[${device_info.protocol_id}].name`, null),
    };
}

const getHardware = () => Device.exec(`lshw -json`).then(result => result.replace(`\n`, ''))

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
            class_id: interfaces[0].descriptor.bInterfaceClass,
            subclass_id: interfaces[0].descriptor.bInterfaceClass,
            protocol_id: _.get(interfaces, `[0].descriptor.bInterfaceProtocol`),
            type: 'interface'
        }

    } else {
        device_info = {
            class_id: descriptor.bDeviceClass,
            subclass_id: descriptor.bDeviceSubClass,
            protocol_id: descriptor.bDeviceProtocol,
            type: 'device'
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
        using_hub: (device.portNumbers.length > 2),
        device
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
    getDevices,
    getHardware
}