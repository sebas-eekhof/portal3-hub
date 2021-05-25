const simpleGit = require("simple-git");
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

module.exports = {
    pull,
    fetch,
    reset,
    forcePull
}