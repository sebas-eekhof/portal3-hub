const Printer = require('@thiagoelg/node-printer');
const Device = require('./Device');

const getPrinters = () => Printer.getPrinters()
const getCommands = () => Printer.getSupportedJobCommands()
const getDrivers = async () => {
    let list = await Device.exec(`lpinfo --make-and-model "DYMO Labelwriter 450" -m`)
    console.log(list)
}

module.exports = {
    getPrinters,
    getCommands,
    getDrivers
}