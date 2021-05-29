const simpleGit = require("simple-git");
const git = simpleGit({
    baseDir: `/root/portal3-hub`,
    binary: 'git',
    maxConcurrentProcesses: 6
});

const pull = () => git.pull();
const fetch = () => git.fetch();
const reset = () => git.reset('hard');
const forcePull = async () => {
    await reset();
    await pull();
    return true;
}
const needUpdate = async () => {
    const Device = require('./Device');
    await Device.exec('cd /root/portal3-hub && git fetch')
    const mine = await Device.exec('cd /root/portal3-hub && git rev-parse HEAD')
    const incomming = await Device.exec('cd /root/portal3-hub && git rev-parse @{u}')
    return mine !== incomming
}

module.exports = {
    pull,
    fetch,
    reset,
    forcePull,
    needUpdate
}