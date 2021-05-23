var gpiop = require('rpi-gpio').promise;

const PINS = {
    led1: { type: gpiop.DIR_OUT, pin: 40 },
    led2: { type: gpiop.DIR_OUT, pin: 38 },
    led3: { type: gpiop.DIR_OUT, pin: 35 }
}

const init = async () => {
    for(let i = 0; i < Object.keys(PINS).length; i++) {
        const pin = PINS[Object.keys(PINS)[i]];
        await gpiop.setup(pin.pin, pin.type)
    }
}

const Set = (pin, status = true) => gpiop.write(pin.pin, status)

module.exports = {
    init,
    PINS,
    Set
}