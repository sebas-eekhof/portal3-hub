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
const getWifiScan = () => wifi.scan()
const connectWifi = (ssid, psk) => wifi.connect({ssid, psk})
const getNetworks = () => wifi.getNetworks()
const disconnectWifi = async () => {
    const networks = await getNetworks();
    for(let i = 0; i < networks.length; i++)
        await wifi.wpa_cli(sprintf('remove_network %d', networks[i].id), '^OK');
    return wifi.wpa_cli(sprintf('save_config'), '^OK');
}

module.exports = {
    getActiveInterface,
    getPublicIp,
    getPrivateIp,
    getGatewayIp,
    getInterfaces,
    getWifiState,
    getConnectedWifiNetwork,
    disconnectWifi,
    connectWifi,
    getWifiScan
}