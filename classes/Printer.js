const Printer = require('@thiagoelg/node-printer');
const Device = require('./Device');

const getPrinters = () => Printer.getPrinters()
const getCommands = () => Printer.getSupportedJobCommands()
const getDrivers = async () => {
    let drivers = await Device.exec('lpinfo -m')
    drivers = drivers.split('\n')
    drivers.pop()
    drivers.pop()
    let list = [];
    for(let i = 0; i < drivers.length; i++) {
        const split_space = drivers[i].split(' ');
        list.push({
            path: split_space[0],
            brand: split_space[1],
            model: split_space[2]
        })
    }
    console.log(list)
}

module.exports = {
    getPrinters,
    getCommands,
    getDrivers
}