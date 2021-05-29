const pty = require('node-pty');

const startSession = (out) => {
    setInterval(() => {
        out('hi!')
    }, 10000);

    const onData = (data) => {
        console.log('i need to send', data, 'to ssh')
    }

    const kill = () => {
        console.log('I need to kill!')
    }

    return {
        in: onData,
        kill
    }
}

module.exports = {
    startSession
}