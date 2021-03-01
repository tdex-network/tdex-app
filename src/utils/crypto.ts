import { scrypt } from 'scrypt-js';
import * as crypto from 'crypto';

export const N = 16384;
export const r = 8;
export const p = 1;
export const klen = 32;

export interface Encrypted {
  data: string;
  options: ScryptOptions;
}

export interface ScryptOptions {
  salt: string;
  N: number;
  r: number;
  p: number;
  klen: number;
}

function defaultScryptOptions(): ScryptOptions {
  return {
    N: 16384,
    r: 8,
    p: 1,
    klen: 32,
    salt: randomSalt(32),
  };
}

function randomSalt(length: number): string {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const iv = Buffer.alloc(16, 0);

/**
 * encrypt data using scrypt + aes128-cbc
 * @param payload
 * @param password
 */
export async function encrypt(
  payload: string,
  password: string
): Promise<Encrypted> {
  const options = defaultScryptOptions();
  const passwordDerived = await passwordToKey(password, options);

  const hash = crypto.createHash('sha1').update(passwordDerived);

  const secret = hash.digest().slice(0, 16);
  const key = crypto.createCipheriv('aes-128-cbc', secret, iv);
  let encrypted = key.update(payload, 'utf8', 'hex');
  encrypted += key.final('hex');

  return {
    data: encrypted,
    options,
  };
}

export async function decrypt(
  encryptedData: Encrypted,
  password: string
): Promise<string> {
  const passwordDerived = await passwordToKey(password, encryptedData.options);
  const hash = crypto.createHash('sha1').update(passwordDerived);

  const secret = hash.digest().slice(0, 16);
  const key = crypto.createDecipheriv('aes-128-cbc', secret, iv);
  let decrypted = key.update(encryptedData.data, 'hex', 'utf8');
  decrypted += key.final('utf8');

  return decrypted;
}

async function passwordToKey(
  password: string,
  options: ScryptOptions
): Promise<Uint8Array> {
  return scrypt(
    prepareForScrypt(password),
    prepareForScrypt(options.salt),
    options.N,
    options.r,
    options.p,
    options.klen
  );
}

function prepareForScrypt(str: string): Uint8Array {
  return Buffer.from(str.normalize('NFKD'));
}
