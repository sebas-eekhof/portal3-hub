const bleno = require('@abandonware/bleno');
const _ = require('lodash');
const { DEVICE_NAME } = require('./general');

const StartBroadcastBle = (service) => {
    bleno.setServices([service.bleService()]);
    process.env['BLENO_DEVICE_NAME'] = DEVICE_NAME;
    if(bleno.state === 'poweredOn')
        bleno.startAdvertising(DEVICE_NAME, [service.service_id]);
    else
        bleno.on('stateChange', status => (status === 'poweredOn') ? bleno.startAdvertising(DEVICE_NAME, [service.service_id]) : () => {});
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