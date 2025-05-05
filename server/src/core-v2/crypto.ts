import crypto from 'crypto';
import { AppError } from './errors';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const KEY_LENGTH = 32;
const AUTH_TAG_LENGTH = 16;

interface EncryptedData {
  iv: string;
  encryptedData: string;
  authTag: string;
  salt: string;
}

/**
 * Derive encryption key from password using PBKDF2
 */
function deriveKey(password: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(password, salt, 100000, KEY_LENGTH, 'sha512');
}

/**
 * Encrypt data using AES-256-GCM
 */
export function encrypt(data: string): EncryptedData {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const salt = crypto.randomBytes(SALT_LENGTH);
    const key = deriveKey(process.env.ENCRYPTION_KEY!, salt);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();

    return {
      iv: iv.toString('hex'),
      encryptedData: encrypted,
      authTag: authTag.toString('hex'),
      salt: salt.toString('hex')
    };
  } catch (error) {
    throw new AppError('Encryption failed', 500, { error });
  }
}

/**
 * Decrypt data using AES-256-GCM
 */
export function decrypt(encryptedData: EncryptedData): string {
  try {
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const encrypted = Buffer.from(encryptedData.encryptedData, 'hex');
    const authTag = Buffer.from(encryptedData.authTag, 'hex');
    const salt = Buffer.from(encryptedData.salt, 'hex');
    const key = deriveKey(process.env.ENCRYPTION_KEY!, salt);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString('utf8');
  } catch (error) {
    throw new AppError('Decryption failed', 500, { error });
  }
}

/**
 * Generate a random token
 */
export function generateToken(length = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Hash a string using SHA-256
 */
export function hashString(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Compare a string with a hash in a timing-safe way
 */
export function compareHash(data: string, hash: string): boolean {
  const dataHash = hashString(data);
  return crypto.timingSafeEqual(
    Buffer.from(dataHash, 'hex'),
    Buffer.from(hash, 'hex')
  );
}