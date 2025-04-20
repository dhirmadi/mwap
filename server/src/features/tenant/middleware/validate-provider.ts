import { Request, Response, NextFunction } from 'express';
import { ProviderFactory } from '../services/providers/provider-factory';
import { AppError } from '@core/errors';
import { logger } from '@core/utils';

export const validateProvider = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const provider = req.params.provider?.toLowerCase() || req.body.provider?.toLowerCase();

    if (!provider) {
      throw new AppError('Provider is required', 400);
    }

    // Check if provider is registered and enabled
    if (!ProviderFactory.isProviderEnabled(provider)) {
      throw new AppError(`Provider ${provider} not found or disabled`, 400);
    }

    logger.debug('Provider validation successful', {
      provider,
      path: req.path
    });

    next();
  } catch (error) {
    next(error);
  }
};

export const validateProviderCapability = (capability: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const provider = req.params.provider?.toLowerCase() || req.body.provider?.toLowerCase();

      if (!provider) {
        throw new AppError('Provider is required', 400);
      }

      // Get provider metadata
      const metadata = ProviderFactory.getAvailableProviders()
        .find(p => p.id === provider);

      if (!metadata) {
        throw new AppError(`Provider ${provider} not found`, 400);
      }

      // Check capability
      if (!metadata.capabilities[capability]) {
        throw new AppError(`Operation not supported by provider ${provider}`, 400);
      }

      logger.debug('Provider capability validation successful', {
        provider,
        capability,
        path: req.path
      });

      next();
    } catch (error) {
      next(error);
    }
  };
};