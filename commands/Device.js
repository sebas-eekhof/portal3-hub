const Device = require('../classes/Device');

const getSerialNumber = Device.GetSerialNumber

const getSomething = () => 'Hallo daar!';

module.exports = {
    getSerialNumber,
    getSomething
}