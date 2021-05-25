const network = require('../classes/Network');

module.exports = {
    getActiveInterface: network.getActiveInterface,
    getPublicIp: network.getPublicIp,
    getPrivateIp: network.getPrivateIp,
    getGatewayIp: network.getGatewayIp,
    getInterfaces: network.getInterfaces,
    disconnect: network.disconnectWifi,
    wifi: {
        state: network.getWifiState,
        current_network: network.getConnectedWifiNetwork,
    }
}