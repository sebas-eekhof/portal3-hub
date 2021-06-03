const HID = require('node-hid');
const Scanner = require('usb-barcode-scanner');

const getDevices = () => Scanner.getDevices;

const streamDevice = ({out, onError}, {device}) => {
    const scanner = new Scanner.UsbScanner({
        path: device
    })

    const deviceData = (data) => {
        data = data.toString();
        out(data)
    }

    scanner.on('data', deviceData)

    return {
        init: () => {
            scanner.startScanning();
        },
        kill: () => {
            scanner.stopScanning();
        }
    }
}

module.exports = {
    getDevices,
    streamDevice
}