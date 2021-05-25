const Storage = require('../classes/Storage');

module.exports = {
    get: Storage.get,
    set: Storage.set,
    has: Storage.has,
    delete: Storage.delete,
    clear: Storage.clear
}