import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';
import { validateRequest, type RequestWithValidated } from '../validateRequest';
import { AppError } from '../../core-v2/errors';

describe('validateRequest middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {};
    nextFunction = jest.fn();
  });

  const testSchema = z.object({
    name: z.string().min(2),
    age: z.number().min(18),
    email: z.string().email(),
  });

  it('should validate and parse valid body data', async () => {
    const validData = {
      name: 'John',
      age: 25,
      email: 'john@example.com',
    };
    mockRequest.body = validData;

    const middleware = validateRequest(testSchema);
    await middleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(nextFunction).toHaveBeenCalledWith();
    expect((mockRequest as RequestWithValidated).validated).toEqual(validData);
  });

  it('should validate query parameters', async () => {
    const validQuery = {
      name: 'Jane',
      age: '20',
      email: 'jane@example.com',
    };
    mockRequest.query = validQuery;

    const querySchema = testSchema.transform((data) => ({
      ...data,
      age: Number(data.age),
    }));

    const middleware = validateRequest(querySchema, 'query');
    await middleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(nextFunction).toHaveBeenCalledWith();
    expect((mockRequest as RequestWithValidated).validated).toEqual({
      name: 'Jane',
      age: 20,
      email: 'jane@example.com',
    });
  });

  it('should handle validation errors', async () => {
    const invalidData = {
      name: 'J', // too short
      age: 16, // too young
      email: 'invalid-email', // invalid format
    };
    mockRequest.body = invalidData;

    const middleware = validateRequest(testSchema);
    await middleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(nextFunction).toHaveBeenCalledWith(expect.any(AppError));
    const error = nextFunction.mock.calls[0][0] as AppError;
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.details).toHaveLength(3); // 3 validation errors
  });

  it('should handle non-Zod errors', async () => {
    const error = new Error('Unexpected error');
    mockRequest.body = {};

    // Mock schema to throw non-Zod error
    const failingSchema = z.object({}).transform(() => {
      throw error;
    });

    const middleware = validateRequest(failingSchema);
    await middleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(nextFunction).toHaveBeenCalledWith(error);
  });

  it('should validate URL parameters', async () => {
    const validParams = {
      id: '123',
      type: 'user',
    };
    mockRequest.params = validParams;

    const paramsSchema = z.object({
      id: z.string().uuid(),
      type: z.enum(['user', 'admin']),
    });

    const middleware = validateRequest(paramsSchema, 'params');
    await middleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(nextFunction).toHaveBeenCalledWith(expect.any(AppError));
    const error = nextFunction.mock.calls[0][0] as AppError;
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.details).toHaveLength(1); // Invalid UUID format
  });
});