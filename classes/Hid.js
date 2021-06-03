const HID = require('node-hid');

const getDevices = () => HID.devices();

const streamDevice = ({out, onError}, {device}) => {
    HID.setDriverType('libusb')
    const dev = new HID.HID(device);

    const deviceData = (data) => {
        console.log(data)
        out(data)
    }

    dev.on('data', deviceData)
    dev.on('error', onError)

    return {
        init: () => {},
        kill: () => {
            dev.removeAllListeners('data');
            dev.removeAllListeners('error');
        }
    }
}

module.exports = {
    getDevices,
    streamDevice
}