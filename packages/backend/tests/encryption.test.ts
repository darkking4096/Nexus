import { describe, it, expect } from 'vitest';
import { encrypt, decrypt, encryptJSON, decryptJSON } from '../src/utils/encryption';

describe('Encryption', () => {
  const masterKey = 'my-super-secret-key-min-32-characters-xxxxx';

  it('should encrypt and decrypt plaintext', () => {
    const plaintext = 'This is a secret message';
    const encrypted = encrypt(plaintext, masterKey);

    expect(encrypted).toBeTruthy();
    expect(encrypted).not.toBe(plaintext);

    const decrypted = decrypt(encrypted, masterKey);
    expect(decrypted).toBe(plaintext);
  });

  it('should encrypt and decrypt buffer', () => {
    const plaintext = Buffer.from('Binary data');
    const encrypted = encrypt(plaintext, masterKey);

    expect(encrypted).toBeTruthy();

    const decrypted = decrypt(encrypted, masterKey);
    expect(decrypted).toBe(plaintext.toString('utf-8'));
  });

  it('should encrypt and decrypt JSON', () => {
    const data = { userId: '123', email: 'user@example.com', roles: ['admin', 'user'] };
    const encrypted = encryptJSON(data, masterKey);

    expect(encrypted).toBeTruthy();

    const decrypted = decryptJSON(encrypted, masterKey);
    expect(decrypted).toEqual(data);
  });

  it('should fail to decrypt with wrong key', () => {
    const plaintext = 'Secret message';
    const encrypted = encrypt(plaintext, masterKey);

    const wrongKey = 'wrong-key-min-32-characters-xxx';

    expect(() => {
      decrypt(encrypted, wrongKey);
    }).toThrow();
  });

  it('should generate unique ciphertexts for same plaintext', () => {
    const plaintext = 'Same message';

    const encrypted1 = encrypt(plaintext, masterKey);
    const encrypted2 = encrypt(plaintext, masterKey);

    // Different ciphertexts (due to random IV and salt)
    expect(encrypted1).not.toBe(encrypted2);

    // But both decrypt to same plaintext
    expect(decrypt(encrypted1, masterKey)).toBe(plaintext);
    expect(decrypt(encrypted2, masterKey)).toBe(plaintext);
  });
});
