import { describe, it, expect } from 'vitest';
import { encrypt, decrypt, encryptJSON, decryptJSON, deriveKey } from '../src/utils/encryption';

describe('Encryption Utils — AES-256-GCM', () => {
  const testMasterKey = 'my-super-secret-master-key-for-testing';
  const testPlaintext = 'Hello, World! This is sensitive data.';

  describe('encrypt/decrypt roundtrip', () => {
    it('should encrypt and decrypt string correctly', () => {
      const ciphertext = encrypt(testPlaintext, testMasterKey);
      expect(ciphertext).toBeTruthy();
      expect(typeof ciphertext).toBe('string');

      const decrypted = decrypt(ciphertext, testMasterKey);
      expect(decrypted).toBe(testPlaintext);
    });

    it('should produce different ciphertexts for same plaintext (random IV)', () => {
      const cipher1 = encrypt(testPlaintext, testMasterKey);
      const cipher2 = encrypt(testPlaintext, testMasterKey);

      expect(cipher1).not.toBe(cipher2);
      expect(decrypt(cipher1, testMasterKey)).toBe(testPlaintext);
      expect(decrypt(cipher2, testMasterKey)).toBe(testPlaintext);
    });

    it('should handle Buffer input', () => {
      const buffer = Buffer.from(testPlaintext, 'utf-8');
      const ciphertext = encrypt(buffer, testMasterKey);
      const decrypted = decrypt(ciphertext, testMasterKey);

      expect(decrypted).toBe(testPlaintext);
    });
  });

  describe('encryptJSON/decryptJSON', () => {
    const testObject = {
      userId: '12345',
      email: 'test@example.com',
      role: 'admin',
      metadata: { level: 5, verified: true },
    };

    it('should encrypt and decrypt JSON correctly', () => {
      const ciphertext = encryptJSON(testObject, testMasterKey);
      expect(ciphertext).toBeTruthy();

      const decrypted = decryptJSON<typeof testObject>(ciphertext, testMasterKey);
      expect(decrypted).toEqual(testObject);
    });

    it('should preserve nested objects', () => {
      const ciphertext = encryptJSON(testObject, testMasterKey);
      const decrypted = decryptJSON<typeof testObject>(ciphertext, testMasterKey);

      expect(decrypted.metadata.level).toBe(5);
      expect(decrypted.metadata.verified).toBe(true);
    });
  });

  describe('deriveKey', () => {
    it('should derive consistent key with same salt', () => {
      const salt = Buffer.from('fixed-salt-for-testing');
      const key1 = deriveKey(testMasterKey, salt);
      const key2 = deriveKey(testMasterKey, salt);

      expect(key1).toEqual(key2);
      expect(key1.length).toBe(32);
    });

    it('should derive different keys from different master keys', () => {
      const salt = Buffer.from('fixed-salt-for-testing');
      const key1 = deriveKey('key-1', salt);
      const key2 = deriveKey('key-2', salt);

      expect(key1).not.toEqual(key2);
    });

    it('should generate random salt if not provided', () => {
      const key1 = deriveKey(testMasterKey);
      const key2 = deriveKey(testMasterKey);

      expect(key1).not.toEqual(key2);
    });
  });

  describe('Security properties', () => {
    it('should fail to decrypt with wrong master key', () => {
      const ciphertext = encrypt(testPlaintext, testMasterKey);
      const wrongKey = 'wrong-master-key';

      expect(() => {
        decrypt(ciphertext, wrongKey);
      }).toThrow();
    });

    it('should fail to decrypt with corrupted ciphertext', () => {
      const ciphertext = encrypt(testPlaintext, testMasterKey);
      const corrupted = ciphertext.slice(0, -10) + 'xxxxx';

      expect(() => {
        decrypt(corrupted, testMasterKey);
      }).toThrow();
    });

    it('should fail to decrypt modified ciphertext (auth tag verification)', () => {
      const ciphertext = encrypt(testPlaintext, testMasterKey);
      const chars = ciphertext.split('');
      chars[10] = chars[10] === 'A' ? 'B' : 'A';
      const modified = chars.join('');

      expect(() => {
        decrypt(modified, testMasterKey);
      }).toThrow();
    });
  });
});
