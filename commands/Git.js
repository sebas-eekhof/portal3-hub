const Git = require('../classes/Git');

module.exports = {
    pull: Git.pull,
    fetch: Git.fetch,
    reset: Git.reset,
    forcePull: Git.forcePull,
    needUpdate: Git.needUpdate
}