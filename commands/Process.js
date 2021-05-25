const Npm = require('../classes/Npm');
const Git = require('../classes/Git');

const restart = () => {

}

const update = async () => {
    await Git.pull()
    await Npm.install()
}

module.exports = {
    restart
}