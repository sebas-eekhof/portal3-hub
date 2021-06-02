const JSONdb = require('simple-json-db');
const Device = require('./Device');
const db = new JSONdb(Device.IsDevelopment() ? '../portal3/db.bin' : '/portal3/db.bin');
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

module.exports = {
    secret,
    get: (key, fallback = null) => get(key)(fallback),
    set: (key, value) => set(key)(value),
    has: (key) => db.has(key),
    delete: del,
    clear
}