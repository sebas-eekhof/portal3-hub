const Printer = require('../classes/Printer');

module.exports = {
    getPrinters: Printer.getPrinters,
    getCommands: Printer.getCommands,
    getDrivers: ({id}) => Printer.getDrivers(id),
    getDevices: Printer.getDevices,
    getByUsb: ({device}) => Printer.getByUsb(device),
    addPrinter: ({name, uri, driver}) => Printer.addPrinter(name, uri, driver),
    printText: ({text, printer}) => Printer.printText(text, printer)
}