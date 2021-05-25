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

const getModel = async () => {
    const identifiers = [
        {
            check: 'Raspberry Pi 4',
            result: 'portal3_hub_pro'
        },
        {
            check: 'Raspberry Pi 3',
            result: 'portal3_hub'
        },
        {
            check: 'Raspberry Pi zero',
            result: 'portal3_hub_lite'
        },
    ];
    const str = await exec('cat /sys/firmware/devicetree/base/model');
    for(let i = 0; i < identifiers.length; i++)
        if(str.includes(identifiers[i].check))
            return identifiers[i].result;
    return 'Undefined';
}

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
    getModel,
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