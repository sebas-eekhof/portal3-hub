const { spawn } = require('child_process');

const startFollow = () => {
    const process = spawn(`dmesg`, [`-wH`]);
    let i = 0;
    process.stdout.on(`data`, data => {
        console.log(i, data)
        i++;
    })
}

module.exports = {
    startFollow
}