const Printer = require('@thiagoelg/node-printer');
const Device = require('./Device');

const getPrinters = () => Printer.getPrinters()
const getCommands = () => Printer.getSupportedJobCommands()
const getDrivers = async () => {
    try {
        let list = await Device.exec(`lpinfo --device-id "MFG:Brother;MDL:MFC-J5730DW;CMD:HBP,PJL;" -m`)
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