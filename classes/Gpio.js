const Device = require('../classes/Device');
const _ = require('lodash');
const { Delay } = require('../classes/Helpers');
let Gpio, Pigpio;
if(!Device.IsDevelopment()) {
    Pigpio = require('pigpio');
    Gpio = Pigpio.Gpio
}

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
            pin.pwmWrite(effects.wave.data.pwmValue)

            if(effects.wave.data.pwmValue === 255 && effects.wave.data.up)
                effects.wave.data.up = false;

            if(effects.wave.data.pwmValue === 0 && !effects.wave.data.up)
                effects.wave.data.up = true;
        }
    },
    blink_once: {
        call: async (pin) => {
            pin.digitalWrite(true)
            await Delay(10)
            pin.digitalWrite(false)
            return true
        }
    },
    fade_out: {
        call: async (pin) => {
            for(let i = 255; i >= 0; i--) {
                pin.pwmWrite(i)
                await Delay(4)
            }
            return true
        }
    },
    fade_in: {
        call: async (pin) => {
            for(let i = 0; i <= 255; i++) {
                pin.pwmWrite(i)
                await Delay(4)
            }
            return true
        }
    },
    blink_once_fade: {
        call: async (pin) => {
            await effects.blink_once.call(pin)
            await Delay(200)
            await effect.fade_out.call(pin)
            return true;
        }
    },
    blink_twice: {
        call: async (pin) => {
            await effects.blink_once.call(pin)
            await Delay(200)
            await effects.blink_once.call(pin)
            return true
        }
    },
    blink_twice_fade: {
        call: async (pin) => {
            await effects.blink_twice.call(pin)
            await Delay(200)
            await effects.fade_out.call(pin)
            return true
        }
    }
}

const init = () => {
    if(!Device.IsDevelopment()) {
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
}

const de_init = () => {
    if(!Device.IsDevelopment())
        for(let i = 0; i < getPins().length; i++) {
            const pin = pins[getPins()[i]];
            if(pin.type === 'led')
                pin.obj.digitalWrite(false);
        }
}

const playEffect = (pin_name, effect, interval = 50, duration = null, once = false) => {
    if(Device.IsDevelopment())
        return false;
    const pin = _.get(pins, pin_name, false);
    if(!pin)
        throw new Error(`Pin with name ${pin_name} does not exists`);
    if(pin.running_effect)
        stopEffect(pin_name)
    if(!_.get(effects, effect, false))
        throw new Error(`Effect with name ${effect} does not exists`);
    if(once)
        effects[effect].call(pin.obj)
    else {
        pins[pin_name].running_effect = setInterval(() => effects[effect].call(pin.obj), interval)
        if(duration !== null)
            setTimeout(() => stopEffect(pin_name), (duration * 1000))
    }
    return true;
}

const playEffectOnce = (pin_name, effect) => {
    const eff = playEffect(pin_name, effect, 0, null, true)
    if(typeof eff.then !== "undefined")
        return eff;
    return true;
}

const stopEffect = (pin_name) => {
    if(Device.IsDevelopment())
        return false;
    if(!_.get(pins, `${pin_name}.running_effect`, false))
        throw new Error(`Pin with name ${pin_name} does not exists or is not playing a effect`);
    clearInterval(pins[pin_name].running_effect)
    pins[pin_name].obj.digitalWrite(false)
    return true;
}

const getPin = (name) => {
    if(Device.IsDevelopment())
        return false;
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
    playEffectOnce,
    stopEffect
}