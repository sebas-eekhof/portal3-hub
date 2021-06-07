const Storage = require('../classes/Storage');
const FileStorage = require('../classes/FileStorage');

module.exports = {
    get: ({key, fallback = null}) => Storage.get(key, fallback),
    set: ({key, value}) => Storage.set(key, value),
    has: ({key}) => Storage.has(key),
    delete: ({key}) => Storage.delete(key),
    clear: Storage.clear,
    wifi: Storage.wifi,
    getDrives: FileStorage.getDrives,
    getDrive: ({drive}) => FileStorage.getDrive(drive),
    readDir: ({path}) => FileStorage.readDir(path),
    rename: ({drive, name}) => FileStorage.rename(drive, name),
    encryptFiles: ({paths}) => FileStorage.encryptFile(paths),
    decryptFiles: ({paths}) => FileStorage.decryptFile(paths),
    
    streamDrives: FileStorage.streamDrives,
    streamFormatDrive: FileStorage.streamFormatDrive,
    streamExplorer: FileStorage.streamExplorer
}