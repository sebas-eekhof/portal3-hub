const Device = require('../classes/Device');
const _ = require('lodash');
let Gpio;
if(!Device.IsDevelopment())
    Gpio = require('pigpio').Gpio

let pins = {}

const init = () => {
    pins = {
        status_led: {
            type: 'led',
            obj: new Gpio(13, {
                mode: Gpio.OUTPUT
            })
        }
    }
}

const de_init = () => {
    for(let i = 0; i < getPins().length; i++) {
        const pin = pins[getPins[i]];
        if(pin.type === 'led')
            pin.obj.digitalWrite(false);
    }
}

const getPin = (name) => {
    if(Device.IsDevelopment())
        throw new Error(`Cannot run GPIO on a development device`);
    const obj = _.get(pins, `${name}.obj`, false);
    if(!obj)
        throw new Error(`Pin with name ${name} does not exists`);
    return obj;
}

const getPins = () => {
    return Object.keys(pins);
};
const pwmWrite = (pin_name, value) => {getPin(pin_name).pwmWrite(value); return true;}
const digitalWrite = (pin_name, value) => {getPin(pin_name).digitalWrite(value); return true;}

module.exports = {
    init,
    de_init,
    getPins,
    pwmWrite,
    digitalWrite
}