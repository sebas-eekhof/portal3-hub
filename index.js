const io = require('socket.io-client');
const Storage = require('./classes/Storage');
const Device = require('./classes/Device');
const Commands = require('./commands');
const logger = require('node-color-log');
const _ = require('lodash');
const Gpio = require('./classes/Gpio');
const ConnectionChecker = require('./classes/ConnectionChecker');
const Printer = require('./classes/Printer');
const Ssh = require('./classes/Ssh');
const Crypto = require('./classes/Crypto');
require('dotenv').config()

const init = async ({console}) => {
    
    console.log('Starting hub service')

    Gpio.init();

    Printer.start_discovery();
    
    Gpio.playEffect('status_led', 'wave', 1)

    const socket = io(_.get(process.env, 'SOCKET_SERVER', 'wss://portal3.nl:7474'), { secure: (typeof process.env.SOCKET_SERVER === "undefined"), reconnection: true, rejectUnauthorized: false, query: { hub_serial: await Device.GetSerialNumber(), model: await Device.getModel() }, maxReconnectionAttempts: Infinity })

    ConnectionChecker.start({socket});

    console.log('Starting to connect to socket')

    socket.connect();

    socket.on('reconnect', (attempt) => {
        console.log(`Reconnecting to socket, attempt (${attempt})`)
    })

    socket.on('ping', () => socket.emit('pong'))

    socket.on('reconnect_error', (e) => {
        console.error(`Received socket error: ${e.message}`)
    })

    socket.on('connect_error', (e) => {
        console.error(`Received socket error: ${e.message}`)
    })

    socket.on('disconnect', () => {
        console.log('Disconnected from socket')
        Gpio.playEffect('status_led', 'wave', 1)
        setTimeout(() => {
            socket.connect();
        }, 5000)
    })

    socket.on('error', (e) => {
        console.error(`Received socket error: ${e.message}`)
    })

    socket.on('connect', () => {
        console.log('Connecting to socket')
        socket.emit('auth::secret', Storage.secret.get(null))
        Gpio.stopEffect('status_led')
    })

    socket.on('auth::secret', (secret) => { Storage.secret.set(secret) })

    socket.on('cmd', async (data) => {
        const { path, uuid, args = {} } = JSON.parse(Buffer.from(await Crypto.Decrypt(data), 'base64').toString())
        const executable = _.get(Commands, `${path}`, false);
        
        console.command(path, args)

        const sendResponse = (response) => {
            console.command_success(path, args)

            let ret = response;
            try {
                ret = Buffer.from(JSON.stringify(ret)).toString('base64');
            } catch(e) {
                ret = Buffer.from(ret).toString('base64')
            }

            socket.emit(`${uuid}.response`, Crypto.Encrypt(response))
        }

        const sendError = (error) => {
            let ret = error;
            if(typeof error.message !== "undefined")
                ret = error.message;
            console.command_error(path, args)
            socket.emit(`${uuid}.error`, Crypto.Encrypt(Buffer.from(ret).toString('base64')))
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

    console.log('Full init service initialized')

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

process.on('exit', exitHandler.bind(null,{cleanup:true}));
process.on('SIGINT', exitHandler.bind(null, {exit:true}));
process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));
process.on('uncaughtException', e => {
    console.error(e.stack)
    exitHandler.bind(null, {exit:true})
});
function exitHandler() {
    Gpio.de_init();
    process.exit()
}