const HID = require('node-hid');
const { EventEmitter } = require('events');

const getDevices = () => HID.devices();

const onData = function(device) {
    const emitter = new EventEmitter();
    const dev = new HID.HID(device.path);
    dev.on('data', data => emitter.emit('data', data))
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
    onData
}