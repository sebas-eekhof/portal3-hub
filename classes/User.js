const linuxUser = require('linux-sys-user').promise();

const getUsers = () => linuxUser.getUsers().then(users => users.filter(user => user.homedir.includes('/portal3/storage')));

module.exports = {
    getUsers
}