import { z } from 'zod';
import { UserIdentity, assertValidUserId } from './userIdentity';

describe('UserIdentity Integration', () => {
  // Create a Zod schema with UserIdentity validation
  const UserSchema = z.object({
    id: z.string().refine(
      (val) => UserIdentity.validate(val), 
      { message: 'Invalid user ID' }
    )
  });

  describe('Zod Schema Validation', () => {
    const validIds = [
      'auth0|123456789012345678901234',
      'google-oauth2|uniqueGoogleId',
      'facebook|uniqueFacebookId'
    ];

    const invalidIds = [
      '',
      'invalid-id',
      'auth0|short',
      'auth0|with space',
      null,
      undefined
    ];

    test.each(validIds)('should validate correct ID: %s', (id) => {
      expect(() => UserSchema.parse({ id })).not.toThrow();
    });

    test.each(invalidIds)('should throw for invalid ID: %s', (id) => {
      expect(() => UserSchema.parse({ id })).toThrow('Invalid user ID');
    });
  });

  describe('Assertion Function', () => {
    const validIds = [
      'auth0|123456789012345678901234',
      'google-oauth2|uniqueGoogleId'
    ];

    const invalidIds = [
      '',
      'invalid-id',
      'auth0|short'
    ];

    test.each(validIds)('should not throw for valid ID: %s', (id) => {
      expect(() => assertValidUserId(id)).not.toThrow();
    });

    test.each(invalidIds)('should throw for invalid ID: %s', (id) => {
      expect(() => assertValidUserId(id)).toThrow();
    });
  });

  describe('Provider Extraction', () => {
    const testCases = [
      { input: 'auth0|123456', expected: 'auth0' },
      { input: 'google-oauth2|user123', expected: 'google-oauth2' },
      { input: 'facebook|user456', expected: 'facebook' },
      { input: 'github|user789', expected: 'github' },
      { input: 'invalidformat', expected: null }
    ];

    test.each(testCases)('should extract provider from $input', ({ input, expected }) => {
      expect(UserIdentity.extractProvider(input)).toBe(expected);
    });
  });
});