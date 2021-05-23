const debug = (msg) => call('DEBUG', msg)

const log = (msg) => call('LOG', msg)

const event = (event) => call('EVENT', event)

const mode = (mode, stop = false, done = true) => {
    if(done)
        call('MODE', `${stop ? 'Stopped' : 'Started'} mode ${mode}`)
    else
        call('MODE', `${stop ? 'Stopping' : 'Starting'} mode ${mode}`)
}

const call = (type, msg) => {
    console.log(`[${type}] ${msg}`)
}

module.exports = {
    debug,
    log,
    event,
    mode
}