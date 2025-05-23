import { Request, Response, NextFunction } from 'express';
import { AppError } from '@core/errors';
import { TenantModel } from '../schemas';
import { AddIntegrationRequest, Integration } from '../types/api';
import { IntegrationProvider } from '../schemas';
import { logger } from '@core/utils';
import { ProviderFactory } from '../services/providers/provider-factory';

export async function getIntegrations(req: Request, res: Response, next: NextFunction) {
  try {
    const tenantId = req.params.id;
    const tenant = await TenantModel.findById(tenantId);
    
    if (!tenant) {
      throw new AppError('Tenant not found', 404);
    }

    // User ownership is already verified by verifyTenantOwner middleware

    logger.info({
      msg: 'Retrieved tenant integrations',
      tenantId,
      userId: req.user.id
    });

    res.json({
      success: true,
      data: tenant.integrations
    });
  } catch (error) {
    next(error);
  }
}

export async function addIntegration(req: Request<{id: string}, unknown, AddIntegrationRequest>, res: Response, next: NextFunction) {
  try {
    const tenantId = req.params.id;
    const { provider, token } = req.body;
    
    const tenant = await TenantModel.findById(tenantId);
    
    if (!tenant) {
      throw new AppError('Tenant not found', 404);
    }

    // User ownership is already verified by verifyTenantOwner middleware

    // Check if integration already exists
    if (tenant.integrations.some(i => i.provider === provider)) {
      throw new AppError(`Integration with provider ${provider} already exists`, 400);
    }

    // Validate token before adding integration
    const cloudProvider = ProviderFactory.createProvider(provider, token);
    if (typeof cloudProvider.validateToken === 'function') {
      const isValid = await cloudProvider.validateToken();
      if (!isValid) {
        throw new AppError(`Invalid or expired ${provider} token`, 401);
      }
    }

    // Get provider metadata for capabilities
    const metadata = ProviderFactory.getAvailableProviders()
      .find(p => p.id === provider);

    if (!metadata) {
      throw new AppError(`Provider ${provider} not found`, 400);
    }

    const newIntegration = {
      provider: provider as IntegrationProvider,
      token,
      refreshToken: req.body.refreshToken,
      expiresAt: req.body.expiresAt,
      connectedAt: new Date(),
      lastRefreshedAt: new Date(),
      capabilities: Object.entries(metadata.capabilities)
        .filter(([_, enabled]) => enabled)
        .map(([capability]) => capability),
      settings: {
        ...req.body.settings,
        scopes: Object.keys(metadata.capabilities)
      }
    };
    tenant.integrations.push(newIntegration);

    await tenant.save();

    logger.info({
      msg: 'Added tenant integration',
      tenantId,
      userId: req.user.id,
      provider
    });

    res.json({
      success: true,
      data: tenant.integrations
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteIntegration(req: Request<{id: string, provider: IntegrationProvider}>, res: Response, next: NextFunction) {
  try {
    const { id: tenantId, provider } = req.params;
    
    const tenant = await TenantModel.findById(tenantId);
    
    if (!tenant) {
      throw new AppError('Tenant not found', 404);
    }

    // User ownership is already verified by verifyTenantOwner middleware

    // Check if integration exists
    const integrationIndex = tenant.integrations.findIndex(i => i.provider === provider);
    if (integrationIndex === -1) {
      throw new AppError(`Integration with provider ${provider} not found`, 404);
    }

    // TODO: Check if any projects are using this integration
    // This will be implemented when project schema is updated to reference integrations

    // Remove integration using MongoDB's $pull operator to avoid validation issues
    await TenantModel.findByIdAndUpdate(
      tenantId,
      { $pull: { integrations: { provider } } },
      { new: true, runValidators: true }
    );

    logger.info({
      msg: 'Deleted tenant integration',
      tenantId,
      userId: req.user.id,
      provider
    });

    res.json({
      success: true,
      data: tenant.integrations
    });
  } catch (error) {
    next(error);
  }
}