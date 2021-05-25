const Apt = require('../classes/Apt');

module.exports = {
    install: ({packages}) => Apt.install(packages),
    update: Apt.update,
    upgrade: Apt.upgrade,
    remove: ({packages}) => Apt.remove(packages)
}