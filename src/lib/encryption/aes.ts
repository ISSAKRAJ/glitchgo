import crypto from 'crypto';

// Get encryption key and hash it with sha256 to ensure it's exactly 32 bytes
const getEncryptionKey = (): Buffer => {
  const rawKey = process.env.ENCRYPTION_KEY || 'default-fallback-insecure-key-32-chars';
  return crypto.createHash('sha256').update(rawKey).digest();
};

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // Standard for AES-GCM

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * Returns a colon-separated string: ivHex:authTagHex:encryptedHex
 */
export function encrypt(text: string): string {
  if (!text) return '';
  
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv) as crypto.CipherGCM;
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');
  
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypts an AES-256-GCM encrypted string.
 * cipherText is formatted as: ivHex:authTagHex:encryptedHex
 */
export function decrypt(cipherText: string): string {
  if (!cipherText) return '';
  
  const parts = cipherText.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted text format');
  }
  
  const [ivHex, authTagHex, encryptedHex] = parts;
  const key = getEncryptionKey();
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv) as crypto.DecipherGCM;
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, undefined, 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
