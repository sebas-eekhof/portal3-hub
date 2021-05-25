const Gpio = require('../classes/Gpio');

const getPins = Gpio.getPins;
const pwmWrite = ({name, value}) => Gpio.pwmWrite(name, value);
const digitalWrite = ({name, value}) => Gpio.digitalWrite(name, value);
const playEffect = ({name, effect, interval = 50, duration = null}) => Gpio.playEffect(name, effect, interval, duration)
const stopEffect = ({name}) => Gpio.stopEffect(name)

module.exports = {
    getPins,
    pwmWrite,
    digitalWrite,
    playEffect,
    stopEffect
}