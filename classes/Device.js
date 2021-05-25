const os = require('os');
const { execSync, execFileSync } = require('child_process');
const raspi_serial = require('raspi-serial-number');

const IsDevelopment = () => {
    return !(os.platform() === 'linux');
}

const GetSerialNumber = () => {
    if(IsDevelopment())
        return Promise.resolve(os.platform());
    return raspi_serial.getSerialNumber();
}

const getSystemUptime = () => os.uptime()
const getCpus = () => os.getCpus()
const getPlatform = () => os.getPlatform()
const getRelease = () => os.getRelease()
const getType = () => os.getType()
const getLoad = () => os.loadavg()
const getMem = () => ({total: os.totalmem(), free: os.freemem()})
const exec = (command) => execSync(command)
const execFile = (file) => execFileSync(file)

module.exports = {
    IsDevelopment,
    GetSerialNumber,
    getSystemUptime,
    getCpus,
    getPlatform,
    getRelease,
    getType,
    getLoad,
    getMem,
    exec,
    execFile
}