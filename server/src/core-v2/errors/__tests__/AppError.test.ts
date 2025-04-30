import { z } from 'zod';
import {
  AppError,
  ValidationError,
  AuthError,
  NotFoundError,
  ErrorCodes,
  type ErrorDetails,
} from '../AppError';

describe('AppError', () => {
  describe('Base AppError', () => {
    it('should create error with all fields', () => {
      const details: ErrorDetails = {
        field: 'test',
        value: 123,
      };

      const error = new AppError(
        'Test error',
        ErrorCodes.BAD_REQUEST,
        400,
        details
      );

      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Test error');
      expect(error.code).toBe(ErrorCodes.BAD_REQUEST);
      expect(error.statusCode).toBe(400);
      expect(error.details).toEqual(details);
      expect(error.stack).toBeDefined();
    });

    it('should use default status code', () => {
      const error = new AppError('Test error', ErrorCodes.INTERNAL);
      expect(error.statusCode).toBe(500);
    });

    it('should serialize to JSON in development', () => {
      process.env.NODE_ENV = 'development';
      
      const error = new AppError(
        'Test error',
        ErrorCodes.BAD_REQUEST,
        400,
        { test: true }
      );

      const json = error.toJSON();
      expect(json).toEqual({
        error: {
          message: 'Test error',
          code: ErrorCodes.BAD_REQUEST,
          details: { test: true },
          stack: expect.any(String),
        },
      });
    });

    it('should serialize to JSON in production', () => {
      process.env.NODE_ENV = 'production';
      
      const error = new AppError(
        'Test error',
        ErrorCodes.BAD_REQUEST,
        400,
        { test: true }
      );

      const json = error.toJSON();
      expect(json).toEqual({
        error: {
          message: 'Test error',
          code: ErrorCodes.BAD_REQUEST,
          details: { test: true },
          // No stack trace in production
        },
      });
    });
  });

  describe('ValidationError', () => {
    it('should create with default message', () => {
      const error = new ValidationError();
      expect(error.message).toBe('Validation failed');
      expect(error.code).toBe(ErrorCodes.VALIDATION);
      expect(error.statusCode).toBe(400);
    });

    it('should create with custom message and details', () => {
      const details: ErrorDetails = {
        fields: ['email', 'password'],
        reason: 'missing_required_fields',
      };

      const error = new ValidationError('Invalid input', details);
      expect(error.message).toBe('Invalid input');
      expect(error.code).toBe(ErrorCodes.VALIDATION);
      expect(error.statusCode).toBe(400);
      expect(error.details).toEqual(details);
    });
  });

  describe('AuthError', () => {
    it('should create with default message and code', () => {
      const error = new AuthError();
      expect(error.message).toBe('Authentication failed');
      expect(error.code).toBe(ErrorCodes.AUTH);
      expect(error.statusCode).toBe(401);
    });

    it('should create with custom message, code and details', () => {
      const details: ErrorDetails = {
        tokenId: '123',
        expiredAt: new Date('2025-01-01'),
      };

      const error = new AuthError(
        'Token expired',
        'AUTH_TOKEN_EXPIRED',
        details
      );

      expect(error.message).toBe('Token expired');
      expect(error.code).toBe('AUTH_TOKEN_EXPIRED');
      expect(error.statusCode).toBe(401);
      expect(error.details).toEqual(details);
    });
  });

  describe('NotFoundError', () => {
    it('should create with resource and id', () => {
      const error = new NotFoundError('User', '123');
      expect(error.message).toBe('User not found with id: 123');
      expect(error.code).toBe(ErrorCodes.NOT_FOUND);
      expect(error.statusCode).toBe(404);
    });

    it('should create with details', () => {
      const details: ErrorDetails = {
        query: { email: 'test@example.com' },
      };

      const error = new NotFoundError('User', '123', details);
      expect(error.message).toBe('User not found with id: 123');
      expect(error.code).toBe(ErrorCodes.NOT_FOUND);
      expect(error.statusCode).toBe(404);
      expect(error.details).toEqual(details);
    });
  });

  describe('fromZodError', () => {
    // Define a test schema
    const UserSchema = z.object({
      email: z.string().email(),
      age: z.number().min(18),
      roles: z.array(z.string()).nonempty(),
      profile: z.object({
        name: z.string().min(2),
        bio: z.string().optional(),
      }),
    });

    it('should convert Zod error to ValidationError', () => {
      // Invalid data
      const result = UserSchema.safeParse({
        email: 'invalid-email',
        age: 16,
        roles: [],
        profile: {
          name: 'a',
          bio: 123, // wrong type
        },
      });

      if (result.success) {
        throw new Error('Schema should not validate');
      }

      const error = AppError.fromZodError(result.error);
      
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toBe('Validation failed');
      expect(error.code).toBe(ErrorCodes.VALIDATION);
      expect(error.statusCode).toBe(400);
      
      // Check error details structure
      expect(error.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: expect.any(String),
            message: expect.any(String),
            code: expect.any(String),
          }),
        ])
      );

      // Verify specific validation errors
      const details = error.details as Array<{
        path: string;
        message: string;
        code: string;
      }>;

      expect(details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'email',
            message: expect.stringContaining('email'),
          }),
          expect.objectContaining({
            path: 'age',
            message: expect.stringContaining('18'),
          }),
          expect.objectContaining({
            path: 'roles',
            message: expect.stringContaining('empty'),
          }),
          expect.objectContaining({
            path: 'profile.name',
            message: expect.stringContaining('2'),
          }),
          expect.objectContaining({
            path: 'profile.bio',
            message: expect.stringContaining('string'),
          }),
        ])
      );
    });

    it('should handle nested object validation', () => {
      const NestedSchema = z.object({
        user: z.object({
          settings: z.object({
            theme: z.enum(['light', 'dark']),
            notifications: z.boolean(),
          }),
        }),
      });

      const result = NestedSchema.safeParse({
        user: {
          settings: {
            theme: 'blue', // invalid enum value
            notifications: 'yes', // wrong type
          },
        },
      });

      if (result.success) {
        throw new Error('Schema should not validate');
      }

      const error = AppError.fromZodError(result.error);
      const details = error.details as Array<{
        path: string;
        message: string;
        code: string;
      }>;

      expect(details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'user.settings.theme',
            message: expect.stringContaining('light'),
          }),
          expect.objectContaining({
            path: 'user.settings.notifications',
            message: expect.stringContaining('boolean'),
          }),
        ])
      );
    });

    it('should handle array validation', () => {
      const ArraySchema = z.object({
        tags: z.array(z.string().min(3)),
        scores: z.array(z.number().positive()),
      });

      const result = ArraySchema.safeParse({
        tags: ['a', 'bb', 'valid'],
        scores: [1, -2, 0, 'invalid'],
      });

      if (result.success) {
        throw new Error('Schema should not validate');
      }

      const error = AppError.fromZodError(result.error);
      const details = error.details as Array<{
        path: string;
        message: string;
        code: string;
      }>;

      expect(details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'tags.0',
            message: expect.stringContaining('3'),
          }),
          expect.objectContaining({
            path: 'tags.1',
            message: expect.stringContaining('3'),
          }),
          expect.objectContaining({
            path: 'scores.1',
            message: expect.stringContaining('positive'),
          }),
          expect.objectContaining({
            path: 'scores.2',
            message: expect.stringContaining('positive'),
          }),
          expect.objectContaining({
            path: 'scores.3',
            message: expect.stringContaining('number'),
          }),
        ])
      );
    });
  });
});