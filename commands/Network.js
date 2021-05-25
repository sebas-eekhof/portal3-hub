const network = require('network');
const util = require('util');

const getActiveInterface = () => util.promisify(network.get_active_interface)()
const getPublicIp = () => util.promisify(network.get_public_ip)()
const getPrivateIp = () => util.promisify(network.get_private_ip)()
const getGatewayIp = () => util.promisify(network.get_gateway_ip)()
const getInterfaces = () => util.promisify(network.get_interfaces_list)()

module.exports = {
    getActiveInterface,
    getPublicIp,
    getPrivateIp,
    getGatewayIp,
    getInterfaces
}