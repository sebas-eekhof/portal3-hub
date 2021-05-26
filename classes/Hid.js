const HID = require('node-hid');

const getDevices = () => HID.devices();

const onData = function(device) {
    const device = new HID.HID(device.path);
    device.on('data', data => this.emit('data', data))
    device.on('error', error => this.emit('error', error))

    return {
        close: () => {
            device.close();
        }
    }
}

module.exports = {
    getDevices,
    onData
}