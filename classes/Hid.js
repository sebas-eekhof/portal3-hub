const HID = require('node-hid');
const { EventEmitter } = require('events');

const getDevices = () => HID.devices();

const streamDevice = ({out, onError}, {device}) => {
    const dev = new HID.HID(device.path);

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

const streamDevice = function(device) {
    const emitter = new EventEmitter();
    const dev = new HID.HID(device.path);
    dev.on('data', data => emitter.emit('data', data.toString('utf-8').trim().replace(/\r?\n|\r/g, '').replace(' ', '').trim()))
    dev.on('error', error => emitter.emit('error', error))

    return {
        pipe: emitter,
        close: () => {
            dev.close();
        }
    }
}

module.exports = {
    getDevices,
    streamDevice
}