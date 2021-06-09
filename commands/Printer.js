const Printer = require('../classes/Printer');

module.exports = {
    getPrinters: Printer.getPrinters,
    getCommands: Printer.getCommands,
    getDrivers: ({printer}) => Printer.getDrivers(printer),
    getDevices: Printer.getDevices,
    getByUsb: ({device}) => Printer.getByUsb(device),
    addPrinter: ({name, uri, driver}) => Printer.addPrinter(name, uri, driver),
    printText: ({text, printer}) => Printer.printText(text, printer),
    removePrinter: ({printer}) => Printer.removePrinter(printer),
    printFromUrl: ({url, printer}) => Printer.printFromUrl(printer, url),
    printFromFile: ({path, filename, printer}) => Printer.printFromFile(printer, filename, path)
}