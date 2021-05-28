const Device = require('./Device');

const getPrinters = async () => {
    let printers = await Device.exec('lpstat -p');
    printers = printers.split('\n')
    printers.pop()
    let printer_list = [];
    for(let i = 0; i < printers.length; i++) {
        let split_space = printers[i].split(' ');
        printer_list.push(split_space[1]);
    }
    console.log(printer_list)
}

module.exports = {
    getPrinters
}