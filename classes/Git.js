const simpleGit = require("simple-git");
const git = simpleGit({
    baseDir: process.cwd(),
    binary: 'git',
    maxConcurrentProcesses: 6
});

const pull = () => git.pull();
const fetch = () => git.fetch();

module.exports = {
    pull,
    fetch
}