const Device = require('./Device');

const install = (packages) => Device.exec(`apt-get install ${packages} -y`)
const update = () => Device.exec(`apt-get update`)
const upgrade = () => Device.exec(`apt-get upgrade -y`)
const remove = (packages) => Device.exec(`apt-get remove --purge -y ${packages}`)

module.exports = {
    install,
    update,
    upgrade,
    remove
}