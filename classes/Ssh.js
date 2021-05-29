const pty = require('node-pty');

const startSession = (out) => {
    const process = pty.spawn('bash', [], {
        name: 'xterm-color',
        cols: 80,
        rows: 30,
        cwd: process.env.HOME,
        env: process.env
    })
    
    process.onData(data  => out(data))

    const onData = (data) => {
        process.write(data)
    }

    const kill = () => {
        process.kill();
    }

    return {
        in: onData,
        kill
    }
}

module.exports = {
    startSession
}