const pty = require('node-pty');

const startSession = (out) => {
    const pty_process = pty.spawn('bash', [], {
        name: 'xterm-color',
        cols: 80,
        rows: 30,
        cwd: process.env.HOME,
        env: process.env
    })
    
    pty_process.onData(data  => out(data))

    const onData = (data) => {
        pty_process.write(data)
    }

    const kill = () => {
        pty_process.kill();
    }

    return {
        in: onData,
        kill
    }
}

module.exports = {
    startSession
}