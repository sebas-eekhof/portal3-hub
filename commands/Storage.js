const Storage = require('../classes/Storage');
const FileStorage = require('../classes/FileStorage');

module.exports = {
    get: ({key, fallback = null}) => Storage.get(key, fallback),
    set: ({key, value}) => Storage.set(key, value),
    has: ({key}) => Storage.has(key),
    delete: ({key}) => Storage.delete(key),
    clear: Storage.clear,
    wifi: Storage.wifi,
    getDrives: FileStorage.drives,
    readDir: ({path}) => FileStorage.readDir(path),
    formatDrive: ({drive}) => FileStorage.formatDrive(drive),
    
    streamDrives: FileStorage.streamDrives
}