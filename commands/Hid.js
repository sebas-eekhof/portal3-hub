const Hid = require('../classes/Hid');

module.exports = {
    getDevices: Hid.getDevices,
    streamDevice: Hid.streamDevice
}