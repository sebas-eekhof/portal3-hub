const { Set, PINS } = require('../../classes/gpio');

let LIGHTNING_STATUS = false;
let MODE;

const StartSetupLightning = (mode) => {
    if(MODE === mode && LIGHTNING_STATUS)
        return;
    LIGHTNING_STATUS = true;
    MODE = mode;
    switch(mode) {
        case '12':
            DoRun12();
        break;
        case '12f':
            DoRun12f();
        break;
    }
}

const StopSetupLightning = () => {
    LIGHTNING_STATUS = false;
    MODE = null;
    Set(PINS.led1, false)
    Set(PINS.led2, false)
    Set(PINS.led3, false)
}

let left = true;
let fast_c = 6;

const DoRun12 = () => {
    if(LIGHTNING_STATUS && MODE === '12') {
        Set(PINS.led1, left)
        Set(PINS.led2, !left)
        left = !left;
        setTimeout(DoRun12, 500)
    }
}

const DoRun12f = () => {
    if(LIGHTNING_STATUS && MODE === '12f') {
        Set(PINS.led1, left)
        Set(PINS.led2, !left)
        left = !left;
        fast_c--;
        if(fast_c === 0) {
            fast_c = 6;
            Set(PINS.led3, true);
            setTimeout(() => Set(PINS.led3, false), 50);
        }
        setTimeout(DoRun12f, 500)
    }
}

module.exports = {
    StartSetupLightning,
    StopSetupLightning
}