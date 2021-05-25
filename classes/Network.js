const network = require('network');
const util = require('util');
const Wifi = require('rpi-wifi-connection');
const wifi = new Wifi();

const getActiveInterface = () => util.promisify(network.get_active_interface)()
const getPublicIp = () => util.promisify(network.get_public_ip)()
const getPrivateIp = () => util.promisify(network.get_private_ip)()
const getGatewayIp = () => util.promisify(network.get_gateway_ip)()
const getInterfaces = () => util.promisify(network.get_interfaces_list)()
const getWifiState = () => wifi.getState()
const getConnectedWifiNetwork = () => wifi.getStatus()
const disconnectWifi = () => {
    return wifi.wpa_cli('list_networks');
}

module.exports = {
    getActiveInterface,
    getPublicIp,
    getPrivateIp,
    getGatewayIp,
    getInterfaces,
    getWifiState,
    getConnectedWifiNetwork,
    disconnectWifi
}