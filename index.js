const { init: InitGpio, Set, PINS } = require('./classes/gpio');
const debug = require('./classes/debug');
const { IsSetup } = require('./classes/storage');
const { SetMode } = require('./modes/index');

debug.event('device_started')

InitGpio().then(async () => {
    debug.event('gpio_inited')
    if(await IsSetup())
        debug.log('DEVICE ALREADY SETUP')
    else
        SetMode('SETUP')
});
