const crypto = require('crypto');
const Storage = require('./Storage');
const Device = require('./Device');
const algorithm = 'aes-256-ctr';

const MakeSecret = async () => {
    const secret = await Storage.secret.get();
    const serial = await Device.GetSerialNumber();
    return crypto.createHash('sha512').update(String(`${secret}-${serial}`)).digest('base64').substr(0, 32)
}

const Encrypt = async (text) => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, await MakeSecret(), iv);
    return Buffer.from(JSON.stringify({
        iv: iv.toString('hex'),
        data: Buffer.concat([cipher.update(text), cipher.final()]).toString('hex')
    })).toString('base64')
}

const Decrypt = async (data) => {
    const hash = JSON.parse(Buffer.from(data, 'base64').toString('ascii'));
    MakeSecret().then(console.log).catch(e => {console.error(e); process.exit()})
    const decipher = crypto.createDecipheriv(algorithm, await MakeSecret(), Buffer.from(hash.iv, 'hex'));
    return Buffer.concat([decipher.update(Buffer.from(hash.data, 'hex')), decipher.final()]).toString();
}

module.exports = {
    Encrypt,
    Decrypt
}