const Printer = require('@thiagoelg/node-printer');
const Device = require('./Device');

const getPrinters = () => Printer.getPrinters()
const getCommands = () => Printer.getSupportedJobCommands()
const getDrivers = async () => {
    try {
        let list = await Device.exec(`lpinfo --make-and-model "Brother MFC-L2750DW" -m`)
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