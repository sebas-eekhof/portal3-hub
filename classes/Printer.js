const Printer = require('@thiagoelg/node-printer');
const Device = require('./Device');
const _ = require('lodash');
const { v4: uuidv4 } = require('uuid');
const { downloadFile, removeFile } = require('./FileStorage');
const IppPrinter = require('ipp-printer');

const getPrinters = async () => {
    const lpstat = await Device.exec(`lpstat -p -d`);
    let matches = [];
    let printers = [];

    console.log(/printer (\w*)/.exec(lpstat))
}

const getPrinterType = async (name) => {
    try {
        const options = await Device.exec(`lpoptions -p ${name} -l`);
        if(options.includes('w288h167'))
            return 'verzendlabels';
        if(options.includes('w102h252'))
            return 'productlabels';
        return 'a4';
    } catch(e) {
        return 'a4';
    }
}

const getPrinterDevice = async (uri) => {
    const setup_device = getSetupPrinters().find(i => i.options['device-uri'] === uri);
    const connected_device = allDevices.find(i => i.uri === uri);
    let ret = {
        ...connected_device,
        setup: setup_device ? true : false,
        setup_device: setup_device ? {
            ...setup_device,
            printer_type: await getPrinterType(setup_device.name)
        } : null
    }
    return ret;
}

const removePrinter = (printer) => Device.exec(`lpadmin -x "${printer}"`)
const printFromUrl = async (printer, url) => {
    const fileName = uuidv4();
    await downloadFile(url, fileName)
    await printFromFile(printer, fileName, '/portal3/tmp')
    removeFile(`/portal3/tmp/${fileName}`)
    return true;
}
const printFromFile = (printer, filename, path) => Device.exec(`cd ${path} && lp -d ${printer} ${filename}`)
const addPrinter = (name, uri, driver) => Device.exec(`lpadmin -p "${name}" -E -v ${uri} -P ${driver}`)





const getDrivers = async (printer) => {
    let list = [];
    try {
        list = await Device.exec(`lpinfo --device-id "${printer.id}" -m`)
            .split('\n')
            .filter(i => (i.length !== 0 && i.includes(':')))
            .map(item => {
                const split_for_maker = item.split(':')[0].split('-');
                const split_for_path = item.split(' ');
                return {
                    maker: split_for_maker[0],
                    uri: split_for_path[0],
                    name: item.replace(`${split_for_path[0]} `, '')
                }
            })
        if(list.length !== 0)
            return list;
    } catch(e) {}
        
    try {
        list = await Device.exec(`lpinfo --make-and-model "${printer.model}" -m`)
            .split('\n')
            .filter(i => (i.length !== 0 && i.includes(':')))
            .map(item => {
                const split_for_maker = item.split(':')[0].split('-');
                const split_for_path = item.split(' ');
                return {
                    maker: split_for_maker[0],
                    uri: split_for_path[0],
                    name: item.replace(`${split_for_path[0]} `, '')
                }
            })
        if(list.length !== 0)
            return list;
    } catch(e) {}

    try {
        const split = printer.model.split(' ');
        let make_model = split[0];
        if(split.length !== 1)
            make_model += ` ${split[1]}`;
        list = await Device.exec(`lpinfo --make-and-model "${make_model}" -m`);
        list = list
            .split('\n')
            .filter(i => (i.length !== 0 && i.includes(':')))
            .map(item => {
                const split_for_maker = item.split(':')[0].split('-');
                const split_for_path = item.split(' ');
                return {
                    maker: split_for_maker[0],
                    uri: split_for_path[0],
                    name: item.replace(`${split_for_path[0]} `, '')
                }
            })
        return list;
    } catch(e) {}
}

module.exports = {
    // start_discovery,
    // start_ipp_broadcast,
    getPrinters,
    // getCommands,
    getDrivers,
    // getDevices,
    // getByUsb,
    addPrinter,
    // printText,
    removePrinter,
    printFromFile,
    printFromUrl
}