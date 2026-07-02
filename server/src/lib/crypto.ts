import crypto from 'node:crypto';

export class SecurityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SecurityError';
  }
}

const rawKey = process.env.ENCRYPTION_KEY;
if (!rawKey) {
  throw new Error("FATAL: ENCRYPTION_KEY environment variable is not defined.");
}

let ENCRYPTION_KEY: Buffer;
try {
  let keyBuffer: Buffer | null = null;
  // Check if rawKey is 64 hex characters (32 bytes)
  if (/^[0-9a-fA-F]{64}$/.test(rawKey)) {
    keyBuffer = Buffer.from(rawKey, 'hex');
  } else {
    // Attempt to decode as base64 and see if it results in 32 bytes
    const base64Buf = Buffer.from(rawKey, 'base64');
    if (base64Buf.length === 32) {
      keyBuffer = base64Buf;
    }
  }

  if (!keyBuffer || keyBuffer.length !== 32) {
    throw new Error("Decoded key is not exactly 32 bytes.");
  }
  ENCRYPTION_KEY = keyBuffer;
} catch (err: any) {
  console.error("FATAL: Invalid ENCRYPTION_KEY configurations during startup.", err);
  throw new Error(`CRITICAL: ENCRYPTION_KEY must be exactly 32 bytes (decoded from hex or base64). Details: ${err.message}`);
}

export interface EncryptedPayload {
  encryptedData: string; // hex-encoded ciphertext
  iv: string;            // hex-encoded IV (12 bytes -> 24 characters)
  authTag: string;       // hex-encoded GCM authentication tag (16 bytes -> 32 characters)
}

/**
 * Encrypts a raw connection string using AES-256-GCM.
 * 
 * @security Constraints:
 * - Uses a cryptographically secure, random 12-byte initialization vector (IV) per call.
 * - Authenticates the data integrity using AES-256-GCM generating a 16-byte authentication tag.
 * - Never returns a simple concatenated string; explicitly segregates the IV and authTag.
 * 
 * @param rawUrl The raw sensitive connection string to encrypt.
 * @returns EncryptedPayload object containing the encryptedData, iv, and authTag.
 */
export function encryptConnectionString(rawUrl: string): EncryptedPayload {
  if (!rawUrl) {
    throw new Error("Cannot encrypt empty connection string");
  }
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv) as crypto.CipherGCM;
  
  let encrypted = cipher.update(rawUrl, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  
  return {
    encryptedData: encrypted,
    iv: iv.toString('hex'),
    authTag: authTag
  };
}

/**
 * Decrypts a connection string payload using AES-256-GCM.
 * 
 * @security Constraints:
 * - Asserts the IV is exactly 24 hex characters (12 bytes).
 * - Asserts the authentication tag is exactly 32 hex characters (16 bytes) to prevent tag truncation attacks.
 * - Verifies the ciphertext integrity via GCM authentication; throws if tampered.
 * 
 * @param payload EncryptedPayload containing ciphertext, iv, and authentication tag.
 * @throws {SecurityError} If IV or authTag fails length validation.
 * @returns The decrypted raw connection string.
 */
export function decryptConnectionString(payload: EncryptedPayload): string {
  const { encryptedData, iv, authTag } = payload;
  
  if (!encryptedData || !iv || !authTag) {
    throw new Error("Invalid decryption input: missing required encrypted payload fields.");
  }
  
  // Assert authTag is exactly 16 bytes (32 hex chars) to prevent tag truncation attacks
  if (authTag.length !== 32 || !/^[0-9a-fA-F]{32}$/.test(authTag)) {
    throw new SecurityError("Security Alert: Invalid Authentication Tag length. Tag truncation attack suspected.");
  }
  
  // Assert IV is exactly 12 bytes (24 hex chars)
  if (iv.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(iv)) {
    throw new SecurityError("Security Alert: Invalid Initialization Vector length.");
  }

  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    ENCRYPTION_KEY,
    Buffer.from(iv, 'hex')
  ) as crypto.DecipherGCM;
  
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
