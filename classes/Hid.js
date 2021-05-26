const HID = require('node-hid');

const getDevices = () => HID.devices();

const onData = function(device) {
    const dev = new HID.HID(device.path);
    dev.on('data', data => this.emit('data', data))
    dev.on('error', error => this.emit('error', error))

    return {
        close: () => {
            dev.close();
        }
    }
}

module.exports = {
    getDevices,
    onData
}