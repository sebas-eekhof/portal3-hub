const JSONdb = require('simple-json-db');
const db = new JSONdb('/portal3/db.bin');
const { Encrypt, Decrypt } = require('./Crypto');

const get = (key) => (fallback = null) => {
    const value = db.get(key);
    if(typeof value === "undefined")
        return fallback;
    return value;
}

const set = (key) => (value) => {
    db.set(key, value);
    db.sync();
    return true;
}

const del = (key) => {
    db.delete(key);
    db.sync();
    return true;
}

const clear = () => {
    db.deleteAll();
    db.sync();
    return true;
}

const secret = {
    set: set('SECRET'),
    get: get('SECRET'),
    has: () => db.has('SECRET'),
    delete: () => db.delete('SECRET')
}

const wifi = {
    set: async ({ssid, psk}) => { set('WIFI_SSID', ssid); set('WIFI_PSK', await Encrypt(psk)) },
    get: async () => { return {
        ssid: get('WIFI_SSID', null),
        psk: (db.has('WIFI_PSK') ? await Decrypt(get('WIFI_PSK')) : null)
    }}
}

module.exports = {
    secret,
    wifi,
    get: (key, fallback = null) => get(key)(fallback),
    set: (key, value) => set(key)(value),
    has: (key) => db.has(key),
    delete: del,
    clear
}