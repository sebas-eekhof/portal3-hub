const Device = require('../classes/Device');

module.exports = {
    getSerialNumber: Device.GetSerialNumber,
    isDevelopment: Device.IsDevelopment,
    getUptime: Device.getSystemUptime,
    getCpus: Device.getCpus,
    getPlatform: Device.getPlatform,
    getRelease: Device.getRelease,
    getType: Device.getType,
    getLoad: Device.getLoad,
    getMem: Device.getMem,
    exec: ({command}) => Device.exec(command),
    version: Device.version,
    doUpdate: Device.doUpdate
}