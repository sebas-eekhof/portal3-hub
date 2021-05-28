const Printer = require('@thiagoelg/node-printer');
const Device = require('./Device');
const _ = require('lodash');

const getPrinters = () => Printer.getPrinters()
const getCommands = () => Printer.getSupportedJobCommands()
const getDevices = async () => {
    let list = await Device.spawn('lpinfo', ['-l', '-v'])
    // let list = await Device.exec('cat test.txt');
    list = list.split('Device: ').filter(i => i.length !== 0)
    let devices = [];
    for(let i = 0; i < list.length; i++) {
        const info_rules = list[i].match(/(\w+) = ([^\s]+)/g);
        let info = {
            uri: null,
            class: null,
            info: null,
            model: null,
            id: null
        }
        for(let i = 0; i < info_rules.length; i++) {
            // console.log(info_rules[i])
            // const rule = info_rules[i].split(' = ');
            // if(rule.length === 2)
            //     if(typeof info[rule[0]] !== "undefined")
            //         info[rule[0]] = rule[1];
        }
        // if(info.id)
            devices.push(info)
    }
    console.log(devices)
    // return devices;
}
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
    getDrivers,
    getDevices
}