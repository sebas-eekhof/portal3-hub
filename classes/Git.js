const simpleGit = require("simple-git");
const Device = require('./Device');
const git = simpleGit({
    baseDir: process.cwd(),
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
    await Device.exec('git fetch')
    const mine = await Device.exec('git rev-parse HEAD')
    const incomming = await Device.exec('git rev-parse @{u}')
    return mine !== incomming
}

module.exports = {
    pull,
    fetch,
    reset,
    forcePull,
    needUpdate
}