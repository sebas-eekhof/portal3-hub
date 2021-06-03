const HID = require('node-hid');

const getDevices = () => HID.devices();

const streamDevice = ({out, onError}, {device}) => {
    const dev = new HID.HID(device);

    const deviceData = (error, data) => {
        console.log(error, data)
        out(data)
    }

    dev.read(deviceData)
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