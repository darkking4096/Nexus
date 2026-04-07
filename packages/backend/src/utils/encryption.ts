import crypto from 'crypto';

/**
 * Encryption utilities using AES-256-GCM
 *
 * Security considerations:
 * - Uses authenticated encryption (GCM mode)
 * - IV is random for each encryption operation
 * - Auth tag is required for decryption verification
 */

const ALGORITHM = 'aes-256-gcm';
const AUTH_TAG_LENGTH = 16; // 128 bits
const IV_LENGTH = 12; // 96 bits (recommended for GCM)
const SALT_LENGTH = 32;

/**
 * Derives encryption key from a master key using PBKDF2
 * TODO(human): Consider if key derivation is needed or if master key can be used directly
 */
export function deriveKey(masterKey: string, salt?: Buffer): Buffer {
  const key = Buffer.from(masterKey);

  if (!salt) {
    salt = crypto.randomBytes(SALT_LENGTH);
  }

  // PBKDF2 with 100,000 iterations
  const derived = crypto.pbkdf2Sync(key, salt, 100000, 32, 'sha256');

  return derived;
}

/**
 * Encrypts data using AES-256-GCM
 * Returns: base64(iv + salt + authTag + encryptedData)
 */
export function encrypt(plaintext: string | Buffer, masterKey: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const salt = crypto.randomBytes(SALT_LENGTH);
  const key = deriveKey(masterKey, salt);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const plaintextBuffer = typeof plaintext === 'string' ? Buffer.from(plaintext, 'utf-8') : plaintext;
  let encrypted = cipher.update(plaintextBuffer);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  const authTag = cipher.getAuthTag();

  // Combine all parts: iv + salt + authTag + encrypted
  const combined = Buffer.concat([iv, salt, authTag, encrypted]);

  return combined.toString('base64');
}

/**
 * Decrypts data encrypted with AES-256-GCM
 * Expects input in format: base64(iv + salt + authTag + encryptedData)
 */
export function decrypt(ciphertext: string, masterKey: string): string {
  const combined = Buffer.from(ciphertext, 'base64');

  // Extract components
  let offset = 0;
  const iv = combined.slice(offset, offset + IV_LENGTH);
  offset += IV_LENGTH;

  const salt = combined.slice(offset, offset + SALT_LENGTH);
  offset += SALT_LENGTH;

  const authTag = combined.slice(offset, offset + AUTH_TAG_LENGTH);
  offset += AUTH_TAG_LENGTH;

  const encrypted = combined.slice(offset);

  // Derive key using extracted salt
  const key = deriveKey(masterKey, salt);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString('utf-8');
}

/**
 * Encrypts and returns JSON-serializable object
 */
export function encryptJSON<T extends Record<string, unknown>>(data: T, masterKey: string): string {
  const json = JSON.stringify(data);
  return encrypt(json, masterKey);
}

/**
 * Decrypts and parses JSON
 */
export function decryptJSON<T extends Record<string, unknown>>(ciphertext: string, masterKey: string): T {
  const plaintext = decrypt(ciphertext, masterKey);
  return JSON.parse(plaintext) as T;
}
