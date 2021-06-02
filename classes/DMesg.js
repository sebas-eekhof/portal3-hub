const { spawn } = require('child_process');
const _ = require('lodash');
const Device = require('./Device');

const DMESG_DEVICE_TYPE = Object.freeze({
    printer: 'printer',
    storage: 'storage',
    scanner: 'scanner'
})

const DMESG_EVENT_TYPE = Object.freeze({
    connect: 'connect',
    disconnect: 'disconnect'
})

let USB_DEVICES = {

}

const processDmesg = (data) => {
    console.log(data)
}

const startFollow = async () => {
    
    let current_identifier = null;
    let stack = {};

    Device.exec('dmesg -C')
    const process = spawn(`dmesg`, [`-wHt`]);
    process.stdout.on(`data`, data => {
        const lines = data.toString().split('\n')
        for(let i = 0; i < lines.length; i++) {
            const id_message = lines[i].split(': ');
            const identifier = id_message[0].replace(`] `, ``).trim();
            const message = line.replace(`${id_message[0]}: `, ``).trim();
            
            
            if(identifier.length === 0 && message.length === 0) {
                if(!current_identifier || typeof stack[current_identifier] === "undefined") {
                    console.error(`Cant process ${current_identifier}.`)
                } else {
                    processDmesg({
                        identifier: current_identifier,
                        messages: stack[current_identifier]
                    });
                    delete stack[current_identifier];
                    current_identifier = null;
                }
            } else {
                current_identifier = identifier;
                if(typeof stack[identifier] === "undefined")
                    stack[identifier] = [
                        message
                    ]
                else
                    stack[identifier].push(message)
            }
        }
    })
}

module.exports = {
    startFollow
}