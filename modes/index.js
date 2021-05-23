const { StartSetupMode, StopSetupMode } = require('./setup_mode');
const debug = require('../classes/debug');

const MODES = {
    SETUP: {
        start: StartSetupMode,
        stop: StopSetupMode
    },
    BOOTING: {
        start: () => {},
        stop: () => {}
    }
}

let CURRENT_MODE = 'BOOTING';

const SetMode = (mode) => {
    debug.mode(CURRENT_MODE, true, false)
    MODES[CURRENT_MODE].stop();
    debug.mode(CURRENT_MODE, false, true)
    CURRENT_MODE = mode;
    debug.mode(CURRENT_MODE, true, false)
    MODES[CURRENT_MODE].start();
    debug.mode(CURRENT_MODE, false, true)
}

module.exports = {
    SetMode,
    CURRENT_MODE
}