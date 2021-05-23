const Service = require('../classes/Service');
const { getSerialNumber } = require('raspi-serial-number');
const { ScanWifi, WifiSettings } = require('../classes/network');

const SERVICE_ID = '0a9c36ee-0bba-431a-a6a9-87fbe7949d62';

const SetupService = new Service(SERVICE_ID, {
    '1c5e1850-467e-47f3-a5ff-ab4c524ec2f6': {
        name: 'serial_number',
        read: () => getSerialNumber()
    },
    '802844da-2712-4628-9a66-4c3e40d43b39': {
        name: 'wifi_scan',
        read: () => ScanWifi().then(JSON.stringify)
    },
    '24907c1d-268e-4e9d-86ef-9545f1a25d9a': {
        name: 'wifi_settings',
        read: () => WifiSettings().then(JSON.stringify)
    }
});

module.exports = SetupService