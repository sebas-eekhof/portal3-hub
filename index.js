const io = require('socket.io-client');
const Storage = require('./classes/Storage');
const Device = require('./classes/Device');
const Commands = require('./commands');
const logger = require('node-color-log');
const _ = require('lodash');
const Gpio = require('./classes/Gpio');

const init = async ({console}) => {
    
    if(!Device.IsDevelopment())
        Gpio.init();

    const socket = io('ws://192.168.120.213:7474', { query: { hub_serial: 'test123', model: 'Portal3 Hub Lite1' }, maxReconnectionAttempts: Infinity })

    socket.connect();

    socket.on('disconnect', () => setTimeout(() => { socket.connect(); }, 5000))

    socket.on('connect', () => { socket.emit('auth::secret', Storage.secret.get()) })

    socket.on('auth::secret', (secret) => { Storage.secret.set(secret) })

    socket.on('cmd', ({ path, args = {} }) => {
        const executable = _.get(Commands, `${path}`, false);
        
        console.command(path, args)

        const sendResponse = (response) => {
            console.command_success(path, args)
            socket.emit(`cmd::${path}::response`, response)
        }

        const sendError = (error) => {
            let ret = error;
            if(typeof error.message !== "undefined")
                ret = error.message;
            console.command_error(path, args)
            socket.emit(`cmd::${path}::error`, ret)
        }

        try {
            if(!executable || typeof executable !== "function")
                throw new Error(`Can't find //${path}(${JSON.stringify(args)})`);
            
            const output = executable(args);
            if(typeof output.then === "function")
                output.then(sendResponse).catch(sendError);
            else
                sendResponse(output)
            
        } catch(e) {
            sendError(e)
        }

    })

}

const CreateLogger = () => {
    const SendMessage = (color, tag, message) => {
        logger.color(color).log(`[${tag}]`);
        logger.joint().log(' ')
        logger.joint().color('white').log(message);
    }

    return {
        debug: (message) => SendMessage('yellow', 'DEBUG', message),
        log: (message) => SendMessage('yellow', 'LOG', message),
        error: (message) => SendMessage('red', 'ERROR', message),
        info: (message) => SendMessage('blue', 'INFO', message),
        command: (path, args) => SendMessage('yellow', 'CMD', `${path}(${JSON.stringify(args)})`),
        command_success: (path, args) => SendMessage('green', 'CMD', `${path}(${JSON.stringify(args)})\n`),
        command_error: (path, args) => SendMessage('red', 'CMD', `${path}(${JSON.stringify(args)})\n`),
    }
}

init({console: CreateLogger()});
