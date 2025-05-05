import { UserIdentity, assertValidUserId } from './userIdentity';

describe('UserIdentity', () => {
  describe('validate', () => {
    const validIds = [
      'auth0|123456789012345678901234',
      'google-oauth2|uniqueGoogleId',
      'facebook|uniqueFacebookId',
      'github|uniqueGithubId'
    ];

    const invalidIds = [
      '',
      null,
      undefined,
      'invalid-id',
      'auth0|',
      'auth0|short',
      'auth0|with space',
      'auth0|with-special-chars!@#'
    ];

    test.each(validIds)('should validate correct ID: %s', (id) => {
      expect(UserIdentity.validate(id)).toBe(true);
    });

    test.each(invalidIds)('should invalidate incorrect ID: %s', (id) => {
      expect(UserIdentity.validate(id as string)).toBe(false);
    });
  });

  describe('extractProvider', () => {
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

  describe('sanitize', () => {
    const testCases = [
      { input: 'auth0|valid-id', expected: 'auth0|valid-id' },
      { input: 'auth0|valid id', expected: 'auth0|valid-id' },
      { input: 'auth0|valid!@#id', expected: 'auth0|valid-id' }
    ];

    test.each(testCases)('should sanitize ID: $input', ({ input, expected }) => {
      expect(UserIdentity.sanitize(input)).toBe(expected);
    });
  });

  describe('assertValidUserId', () => {
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
});