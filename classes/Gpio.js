const Device = require('../classes/Device');
const _ = require('lodash');
let Gpio;
if(!Device.IsDevelopment())
    Gpio = require('pigpio').Gpio

let pins = {}

const init = async () => {
    pins = {
        fan: {
            type: 'fan',
            obj: new Gpio(32, {
                mode: Gpio.OUTPUT
            })
        },
        status_led: {
            type: 'led',
            obj: new Gpio(33, {
                mode: Gpio.OUTPUT
            })
        }
    }
    setTimeout(() => {return true}, 1000)
}

const getPin = (name) => {
    if(Device.IsDevelopment())
        throw new Error(`Cannot run GPIO on a development device`);
    const obj = _.get(pins, `${name}.obj`, false);
    if(!obj)
        throw new Error(`Pin with name ${name} does not exists`);
    return obj;
}

const pwmWrite = (pin_name, value) => {getPin(pin_name).pwmWrite(value); return true;}
const digitalWrite = (pin_name, value) => {getPin(pin_name).digitalWrite(value); return true;}

module.exports = {
    init,
    pins,
    pwmWrite,
    digitalWrite
}