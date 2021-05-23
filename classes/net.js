const express = require('express')

let SERVER = null;

const StartBroadcastNet = (service) => {
    const app = express()
    SERVER = app.listen(8420);
    app.get('/service', (req, res) => res.send(service.service_id))
    service.handleExpress(app)
}

const StopBroadcastNet = () => {
    if(SERVER)
        SERVER.close();
    SERVER = null;
}

module.exports = {
    StartBroadcastNet,
    StopBroadcastNet
}