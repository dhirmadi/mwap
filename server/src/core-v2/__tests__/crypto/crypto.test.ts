import "@jest/globals";
import { encrypt, decrypt, generateToken, hashString, compareHash } from '../../crypto';
import { mockEnv } from '../utils/mockEnv';

describe('Crypto Module', () => {
  mockEnv({
    ENCRYPTION_KEY: 'test-encryption-key-32-chars-exactly!'
  });

  describe('encrypt/decrypt', () => {
    it('should round trip a value securely', () => {
      const originalText = 'sensitive data';
      const encrypted = encrypt(originalText);
      
      expect(encrypted).toHaveProperty('iv');
      expect(encrypted).toHaveProperty('encryptedData');
      expect(encrypted).toHaveProperty('authTag');
      expect(encrypted).toHaveProperty('salt');
      
      const decrypted = decrypt(encrypted);
      expect(decrypted).toBe(originalText);
    });

    it('should encrypt different values differently', () => {
      const text1 = 'data1';
      const text2 = 'data2';
      
      const encrypted1 = encrypt(text1);
      const encrypted2 = encrypt(text2);
      
      expect(encrypted1.encryptedData).not.toBe(encrypted2.encryptedData);
      expect(encrypted1.iv).not.toBe(encrypted2.iv);
      expect(encrypted1.authTag).not.toBe(encrypted2.authTag);
      expect(encrypted1.salt).not.toBe(encrypted2.salt);
    });

    it('should throw on invalid encrypted data', () => {
      const encrypted = encrypt('test');
      encrypted.authTag = 'invalid';
      
      expect(() => decrypt(encrypted)).toThrow();
    });
  });

  describe('generateToken', () => {
    it('should generate a token of specified length', () => {
      const token = generateToken(16);
      expect(token).toHaveLength(32); // hex encoding doubles length
    });

    it('should generate unique tokens', () => {
      const token1 = generateToken();
      const token2 = generateToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe('hashString', () => {
    it('should generate consistent hashes', () => {
      const text = 'test data';
      const hash1 = hashString(text);
      const hash2 = hashString(text);
      expect(hash1).toBe(hash2);
    });

    it('should generate different hashes for different inputs', () => {
      const hash1 = hashString('data1');
      const hash2 = hashString('data2');
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('compareHash', () => {
    it('should return true for matching data and hash', () => {
      const data = 'test data';
      const hash = hashString(data);
      expect(compareHash(data, hash)).toBe(true);
    });

    it('should return false for non-matching data and hash', () => {
      const hash = hashString('original');
      expect(compareHash('different', hash)).toBe(false);
    });

    it('should be timing-safe', () => {
      const data = 'test'.padStart(1000, 'a');
      const hash = hashString(data);
      
      const start = process.hrtime();
      compareHash(data, hash);
      const [s1, ns1] = process.hrtime(start);
      
      const start2 = process.hrtime();
      compareHash('wrong'.padStart(1000, 'b'), hash);
      const [s2, ns2] = process.hrtime(start2);
      
      // Times should be within 10% of each other
      const time1 = s1 * 1e9 + ns1;
      const time2 = s2 * 1e9 + ns2;
      const ratio = Math.max(time1, time2) / Math.min(time1, time2);
      expect(ratio).toBeLessThan(1.1);
    });
  });
});