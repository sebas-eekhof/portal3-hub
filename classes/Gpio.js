const Device = require('../classes/Device');
const _ = require('lodash');
let Gpio;
if(!Device.IsDevelopment())
    Gpio = require('pigpio').Gpio

let pins = {}
let effects = {
    wave: {
        data: {
            pwmValue: 0,
            up: true
        },
        call: (pin) => {
            if(effects.wave.data.up)
                effects.wave.data.pwmValue++;
            else
                effects.wave.data.pwmValue--;
            pin.obj.pwmWrite(effects.wave.data.pwmValue)
        }
    }
}

const init = () => {
    if(!Device.IsDevelopment())
        pins = {
            status_led: {
                running_effect: null,
                type: 'led',
                obj: new Gpio(13, {
                    mode: Gpio.OUTPUT
                })
            }
        }
}

const de_init = () => {
    if(!Device.IsDevelopment())
        for(let i = 0; i < getPins().length; i++) {
            const pin = pins[getPins()[i]];
            if(pin.type === 'led')
                pin.obj.digitalWrite(false);
        }
}

const playEffect = (pin_name, effect, interval = 50, duration = null) => {
    if(Device.IsDevelopment())
        throw new Error(`Cannot run GPIO on a development device`);
    const pin = _.get(pins, pin_name, false);
    if(!pin)
        throw new Error(`Pin with name ${pin_name} does not exists`);
    if(pin.running_effect)
        stopEffect(pin_name)
    if(!_.get(effects, effect, false))
        throw new Error(`Effect with name ${effect} does not exists`);
    pins[pin_name].running_effect = setInterval(() => effects[effect].call(pin.obj), interval)
    if(duration !== null)
        setTimeout(() => stopEffect(pin_name), (duration * 1000))
}

const stopEffect = (pin_name) => {
    if(Device.IsDevelopment())
        throw new Error(`Cannot run GPIO on a development device`);
    const playing_effect = _.get(pins, `${pin_name}.running_effect`, false);
    if(!pin)
        throw new Error(`Pin with name ${pin_name} does not exists or is not playing a effect`);
    clearInterval(pins[pin_name].running_effect)
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
    digitalWrite,
    playEffect,
    stopEffect
}