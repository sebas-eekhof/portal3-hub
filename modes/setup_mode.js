const { StartSetupLightning, StopSetupLightning } = require('./setup/lightning');
const { StartBroadcastBle, StopBroadcastBle } = require('../classes/ble');
const { StartBroadcastNet, StopBroadcastNet } = require('../classes/net');
const { SetupService } = require('../services');

const StartSetupMode = () => {
    StartSetupLightning('12');
    StartBroadcastBle(SetupService);
    StartBroadcastNet(SetupService);

    console.log('Device in SETUP MODE')
}

const StopSetupMode = () => {
    StopSetupLightning();
    StopBroadcastBle();
    StopBroadcastNet();
    console.log('No more setup')
}

module.exports = {
    StartSetupMode,
    StopSetupMode
}