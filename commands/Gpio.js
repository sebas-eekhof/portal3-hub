const Gpio = require('../classes/Gpio');

const getPins = Gpio.getPins;
const pwmWrite = (name, value) => Gpio.pwmWrite(name, value);
const digitalWrite = (name, value) => Gpio.digitalWrite(name, value);

module.exports = {
    getPins,
    pwmWrite,
    digitalWrite
}