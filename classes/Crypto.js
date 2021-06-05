const crypto = require('crypto');
const Device = require('./Device');
const algorithm = 'aes-256-ctr';
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const STATIC_SALT = `SALTYMCSALTSALT!`;

const MakeSecret = async () => {
    const secret = await require('./Storage').secret.get();
    const serial = await Device.GetSerialNumber();
    return crypto.createHash('sha512').update(`${secret}-${serial}`).digest('base64').substr(0, 32)
}

const EncryptFile = async (input) => {
    const secret = await MakeSecret();
    const cipher = crypto.createCipheriv(algorithm, secret, STATIC_SALT);
    const file_uuid = uuidv4()
    await Device.exec(`zip /portal3/tmp/${file_uuid}.enczip ${input}`)
    const infile = fs.readFileSync(`/portal3/tmp/${file_uuid}.enczip`);
    fs.writeFileSync(`${input}.enc`, Buffer.concat([cipher.update(infile), cipher.final()]));
    await Device.exec(`rm -rf /portal3/tmp/${file_uuid}.enczip`)
    await Device.exec(`rm -rf ${input}`)
    return true;
}

const DecryptFile = async (input) => {
    const secret = await MakeSecret();
    const cipher = crypto.createDecipheriv(algorithm, secret, STATIC_SALT);
    const file_uuid = uuidv4()
    const dir = path.dirname(input);
    const infile = fs.readFileSync(input);
    fs.writeFileSync(`/portal3/tmp/${file_uuid}.enczip`, Buffer.concat([cipher.update(infile), cipher.final()]));
    await Device.exec(`unzip -r /portal3/tmp/${file_uuid}.enczip ${dir}`)
    await Device.exec(`rm -rf /portal3/tmp/${file_uuid}.enczip`)
    await Device.exec(`rm -rf ${input}`)
    return true;
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
    let ret = Buffer.from(await Decrypt(data), 'base64').toString();
    try {
        ret = JSON.parse(ret)
    } catch(e) {
        
    }
    return ret;
}

module.exports = {
    Encrypt,
    Decrypt,
    FlowEncrypt,
    FlowDecrypt,
    EncryptFile,
    DecryptFile
}