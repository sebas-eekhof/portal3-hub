const linuxUser = require('linux-sys-user').promise();

const getUsers = () => linuxUser.getUsers();

module.exports = {
    getUsers
}