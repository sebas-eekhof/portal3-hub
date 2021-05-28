const Printer = require('@thiagoelg/node-printer');
const Device = require('./Device');

const getPrinters = () => Printer.getPrinters()
const getCommands = () => Printer.getSupportedJobCommands()
const getDrivers = async () => {
    try {
        let list = await Device.exec(`lpinfo --device-id "MFG:DYMO;CMD: ;MDL:LabelWriter 450;CLASS:PRINTER;DESCRIPTION:DYMO LabelWriter 450;SERN:01010112345600;" -m`)
        console.log(list)
    } catch(e) {
        console.log('drivers not found')
    }
}

module.exports = {
    getPrinters,
    getCommands,
    getDrivers
}