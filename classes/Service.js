const bleno = require('@abandonware/bleno');
const util = require('util');
const _ = require('lodash');

class Service {
    constructor(service_id, endpoints = {}) {
        this.service_id = service_id;
        this.endpoints = endpoints;
        this.bleno_chars = [];
        this.setupChars();
    }

    setupChars() {
        for(let i = 0; i < Object.keys(this.endpoints).length; i++) {
            const endpoint = this.endpoints[Object.keys(this.endpoints)[i]];
            const uuid = Object.keys(this.endpoints)[i];
            let properties = [];
            if(_.get(endpoint, 'read', false))
                properties.push('read');
            if(_.get(endpoint, 'write', false))
                properties.push('write');
            function Char() {
                Char.super_.call(this, {
                    uuid: uuid,
                    properties
                })
            }
            util.inherits(Char, bleno.Characteristic)
            
            if(_.get(endpoint, 'read', false)) {
                Char.prototype.onReadRequest = function(offset, callback) {
                    endpoint.read()
                        .then(result => callback(this.RESULT_SUCCESS, Buffer.from(result)))
                        .catch(() => callback(this.RESULT_UNLIKELY_ERROR))
                }
            }

            this.bleno_chars[uuid] = Char;
        }
    }

    handleExpress(app) {
        for(let i = 0; i < Object.keys(this.endpoints).length; i++) {
            const endpoint = this.endpoints[Object.keys(this.endpoints)[i]];
            const uuid = Object.keys(this.endpoints)[i];

            if(_.get(endpoint, 'read', false))
                app.get(`/${this.service_id}/${uuid}`, (req, res) => {endpoint.read().then(result => res.send(result))})
        }
    }

    bleService() {
        let characteristics = [];
        for(let i = 0; i < Object.keys(this.bleno_chars).length; i++)
            characteristics.push(new this.bleno_chars[Object.keys(this.bleno_chars)[i]]);
        return new bleno.PrimaryService({
            uuid: this.service_id,
            characteristics
        })
    }
}

module.exports = Service;