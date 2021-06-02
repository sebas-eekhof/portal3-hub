const { spawn } = require('child_process');
const _ = require('lodash');

const DMESG_TYPE = Object.freeze({
    printer: 'printer',
    storage: 'storage',
    scanner: 'scanner'
})

const startFollow = () => {
    const process = spawn(`dmesg`, [`-wH`]);
    let i = 0;
    process.stdout.on(`data`, data => {
        const lines = data.toString().split('\n')
        for(let i = 0; i < lines.length; i++) {
            const line = lines[i]
            const time_rest = line.split('] ')
            const message = line.replace(time_rest[0], '');
            const id_message = message.split(': ');
            
            const dat = {
                identifier: id_message[0].replace(`] `, ``),
                message: message.replace(`${id_message[0]}: `, ``)
            }
            console.log(i, dat)
            i++;
        }
    })
}

module.exports = {
    startFollow
}