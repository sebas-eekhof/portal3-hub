const Npm = require('../classes/Npm');
const Git = require('../classes/Git');
const Device = require('../classes/Device');

const restart = () => Device.exec('systemctl restart portal3-hub.service')

const update = async () => {
    await Git.pull()
    await Npm.install()
    await restart()
}

module.exports = {
    restart,
    update
}