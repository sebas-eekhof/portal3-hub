const network = require('../classes/Network');

module.exports = {
    getActiveInterface: network.getActiveInterface,
    getPublicIp: network.getPublicIp,
    getPrivateIp: network.getPrivateIp,
    getGatewayIp: network.getGatewayIp,
    getInterfaces: network.getInterfaces
}