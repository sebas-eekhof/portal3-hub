const network = require('./Network');
const Gpio = require('./Gpio');

let last_is_online = false;

const start = ({socket}) => {
    network.getActiveInterface()
        .then(() => {
            if(socket.connected && !last_is_online)
                Gpio.stopEffect('status_led');
            last_is_online = true;
            setTimeout(() => start({socket}), 1000)
        })
        .catch(() => {
            if(!last_is_online)
                Gpio.playEffect('status_led', 'wave', 1)
            last_is_online = false;
            setTimeout(() => start({socket}), 1000)
        });
}

module.exports = {
    start
}