const os = require('os');
const raspi_serial = require('raspi-serial-number');

const IsDevelopment = () => {
    return !(os.platform() === 'linux');
}

const GetSerialNumber = () => {
    if(IsDevelopment())
        return Promise.resolve(os.platform());
    return raspi_serial.getSerialNumber();
}

module.exports = {
    IsDevelopment,
    GetSerialNumber
}