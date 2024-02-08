import * as crypto from 'node:crypto';

export function encrypt(obj: string | object | number) {
    const { appKey } = useRuntimeConfig();

    const json = JSON.stringify(obj);

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', appKey, iv);
    const encryptedJson = cipher.update(json, 'utf8', 'base64') + cipher.final('base64');

    const result = iv.toString('hex') + encryptedJson;

    return result;
}

export function decrypt(cipherText: string) {
    if( !cipherText ) {
        return null;
    }

    const { appKey } = useRuntimeConfig();

    try {
        const iv = Buffer.from(cipherText.substring(0,32), 'hex');
        const encryptedJson = cipherText.substring(32);

        const decipher = crypto.createDecipheriv('aes-256-cbc', appKey, iv);
        const json = decipher.update(encryptedJson, 'base64', 'utf8') + decipher.final('utf8');

        return JSON.parse(json);
    } catch( e ) {
        return null;
    }
  }