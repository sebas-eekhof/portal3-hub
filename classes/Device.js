const os = require('os');
const { exec: processExec } = require('child_process');
const raspi_serial = require('raspi-serial-number');

const exec = (command) => new Promise((resolve, reject) => {
    processExec(command, (err, stdout, stderr) => {
        if(err) {
            reject(err)
            return
        }
        if(stderr) {
            reject(stderr)
            return
        }
        resolve(stdout)
    })
})

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
    exec
}