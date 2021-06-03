const HID = require('node-hid');

const getDevices = () => HID.devices();

const streamDevice = ({out, onError}, {device}) => {
    const dev = new HID.HID(device);

    const deviceData = (data) => {
        data = data.toString();
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