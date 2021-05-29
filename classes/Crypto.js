const crypto = require('crypto');
const Device = require('./Device');
const algorithm = 'aes-256-ctr';

const MakeSecret = async () => {
    const secret = await require('./Storage').secret.get();
    const serial = await Device.GetSerialNumber();
    return crypto.createHash('sha512').update(`${secret}-${serial}`).digest('base64').substr(0, 32)
}

const Encrypt = async (text) => {
    const secret = await MakeSecret();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, secret, iv);
    return Buffer.from(JSON.stringify({
        iv: iv.toString('hex'),
        data: Buffer.concat([cipher.update(text), cipher.final()]).toString('hex')
    })).toString('base64')
}

const Decrypt = async (data) => {
    const secret = await MakeSecret();
    const hash = JSON.parse(Buffer.from(data, 'base64').toString('ascii'));
    const decipher = crypto.createDecipheriv(algorithm, secret, Buffer.from(hash.iv, 'hex'));
    return Buffer.concat([decipher.update(Buffer.from(hash.data, 'hex')), decipher.final()]).toString();
}

const FlowEncrypt = async (response) => {
    let ret = response;
    try {
        ret = JSON.stringify(ret)
    } catch(e) {
        
    }
    ret = Buffer.from(`${ret}`).toString('base64');
    return Encrypt(ret)
}

const FlowDecrypt = async (data) => {
    console.log(data)
    let ret = Buffer.from(await Decrypt(data), 'base64').toString();
    try {
        ret = JSON.parse(ret)
    } catch(e) {
        
    }
    return await Decrypt(ret)
}

module.exports = {
    Encrypt,
    Decrypt,
    FlowEncrypt,
    FlowDecrypt
}