const Printer = require('@thiagoelg/node-printer');

const getPrinters = () => Printer.getPrinters()
const getCommands = () => Printer.getSupportedJobCommands()

module.exports = {
    getPrinters,
    getCommands
}