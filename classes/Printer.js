const printer = require('printer');

const getPrinters = () => printer.getPrinters();
const getPrinter = (name) => printer.getPrinter(name);
const printDirect = ({type, data, printer}) => new Promise((resolve, reject) => printer.printDirect({type, data, printer, success: resolve, error: reject}));
const printFile = ({printer, path}) => new Promise((resolve, reject) => printer.printFile({type, filename: path, success: resolve, error: reject}));

module.exports = {
    getPrinters,
    getPrinter,
    printDirect,
    printFile
}