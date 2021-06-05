const crypto = require('crypto');
const Device = require('./Device');
const algorithm = 'aes-256-ctr';
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const MakeSecret = async () => {
    const secret = await require('./Storage').secret.get();
    const serial = await Device.GetSerialNumber();
    return crypto.createHash('sha512').update(`${secret}-${serial}`).digest('base64').substr(0, 32)
}

const EncryptFile = async (input, output) => {
    const file_uuid = uuidv4()
    await Device.exec(`zip /portal3/tmp/${file_uuid}.enczip ${path}`)
    const secret = await MakeSecret();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, secret, iv);

    const infile = fs.createReadStream(`/portal3/tmp/${file_uuid}.enczip`);
    const outfile = fs.createWriteStream(output);
    infile.on('data', data => outfile.write(cipher.update(data)))
    infile.on('close', async () => {
        outfile.write(cipher.final());
        outfile.close();
        await Device.exec(`rm -rf /portal3/tmp/${file_uuid}.enczip`)
        return true;
    })
}

const DecryptFile = async (input, output) => {
    const secret = await MakeSecret();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createDecipheriv(algorithm, secret, iv);

    const infile = fs.createReadStream(input);
    const outfile = fs.createWriteStream(output);
    infile.on('data', data => outfile.write(cipher.update(data)))
    infile.on('close', () => {
        outfile.write(cipher.final());
        outfile.close();
        return true;
    })
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
    EncryptFile
}