const os = require('os');
const child_process = require('child_process');
const raspi_serial = require('raspi-serial-number');
const Git = require('./Git');
const Npm = require('./Npm')

const exec = (command) => new Promise((resolve, reject) => {
    child_process.exec(command, (err, stdout, stderr) => {
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

const spawn = (process, args = []) => new Promise((resolve, reject) => {
    const child = child_process.spawn(process, args);
    let outputs = [];
    child.stdout.on('data', data => {
        outputs.push(data.toString())
    })
    child.stderr.on('data', data => {
        reject(data.toString())
    })
    child.on('exit', (code, signal) => {
        resolve(outputs.join('\n'))
    })
})

const getModel = async () => {
    if(IsDevelopment())
        return os.hostname();
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

const doUpdate = async () => {
    await Git.forcePull();
    await exec(`apt-get install -y $(cat /root/portal3-hub/post_install.sh)`)
    await exec('sh /root/portal3-hub/post_install.sh')
    await Npm.install()
    exec(`service portal3-hub restart`)
}

const getSystemUptime = () => os.uptime()
const getCpus = () => os.cpus()
const getPlatform = () => os.getPlatform()
const getRelease = () => os.getRelease()
const getType = () => os.getType()
const getLoad = () => os.loadavg()
const getMem = () => ({total: os.totalmem(), free: os.freemem()})
const version = async () => {
    return {
        name: await exec('cd /root/portal3-hub && git rev-parse --short HEAD'),
        time: await exec('cd /root/portal3-hub && stat -c %Y .git/FETCH_HEAD')
    }
}

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
    exec,
    spawn,
    version,
    doUpdate
}