const Wifi = require('rpi-wifi-connection');
const _ = require('lodash');
const { Wifi: WifiStorage } = require('./storage');

const Connected = async () => {
    
}

const WifiSettings = async () => {
    const has_ssid = await WifiStorage.has_ssid();
    return {
        ssid: (has_ssid) ? await WifiStorage.ssid() : null
    }
}

const ScanWifi = async () => {
    const wifi = new Wifi();
    const scan = await wifi.scan();
    let result = {};
    for(let i = 0; i < scan.length; i++) {
        if(!scan[i].signalLevel < 80 && scan[i].ssid !== '') {
            if(_.get(result, scan[i].ssid, false)) {
                if(result[scan[i].ssid].level < scan[i].signalLevel)
                    result[scan[i].ssid].level = scan[i].signalLevel;
            } else {
                result[scan[i].ssid] = { level: scan[i].signalLevel }
            }
        }
    }
    return result;
}

module.exports = {
    ScanWifi,
    WifiSettings
}