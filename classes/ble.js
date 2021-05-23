const bleno = require('@abandonware/bleno');
const _ = require('lodash');

const SETTINGS = {
    name: 'Portal3 Hub Lite1'
}

const StartBroadcastBle = (service) => {
    bleno.setServices([service.bleService()]);
    process.env['BLENO_DEVICE_NAME'] = SETTINGS.name;
    if(bleno.state === 'poweredOn')
        bleno.startAdvertising(SETTINGS.name, [service.service_id]);
    else
        bleno.on('stateChange', status => (status === 'poweredOn') ? bleno.startAdvertising(SETTINGS.name, [service.service_id]) : () => {});
    console.log(`[BLE] Advertising ${service.service_id}`)
}

const StopBroadcastBle = () => {
    bleno.disconnect();
    bleno.stopAdvertising();
    bleno.setServices([]);
}

module.exports = {
    StartBroadcastBle,
    StopBroadcastBle
}