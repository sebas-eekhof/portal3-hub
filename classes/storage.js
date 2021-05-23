const JSONdb = require('simple-json-db');
const db = new JSONdb('./storage.json');

const IsSetup = async () => {
    return db.has('ACCOUNT_SECRET');
}

const Wifi = {
    has_ssid: () => db.has('WIFI_SSID'),
    has_psk: () => db.has('WIFI_PSK'),
    ssid: () => db.get('WIFI_SSID'),
    psk: () => db.get('WIFI_PSK')
}

module.exports = {
    IsSetup,
    Wifi
}