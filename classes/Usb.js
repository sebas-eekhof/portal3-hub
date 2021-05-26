const usb = require('usb');

const getDevices = () => usb.getDeviceList();

module.exports = {
    getDevices
}