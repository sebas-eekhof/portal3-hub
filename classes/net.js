const express = require('express')
const cors = require('cors');
const dnssd = require('dnssd');

let SERVER = null;
let ad = null;

const StartBroadcastNet = async (service) => {
    if(SERVER || ad)
        await StopBroadcastNet();
    const app = express()
    app.use(cors())
    SERVER = app.listen(8420);
    ad = new dnssd.Advertisement(dnssd.tcp('portal3hub'), 8420);
    ad.start();
    app.get('/service', (req, res) => res.send(service.service_id))
    service.handleExpress(app)
}

const StopBroadcastNet = async () => {
    if(SERVER)
        SERVER.close();
    if(ad)
        await new Promise(resolve => {
            ad.stop(false, () => {
                resolve();
            });
        })
    SERVER = null;
}

module.exports = {
    StartBroadcastNet,
    StopBroadcastNet
}