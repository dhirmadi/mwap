import { Request, Response, NextFunction } from 'express';
import { AppError } from '@core/errors';
import { TenantModel } from '../schemas';
import { AddIntegrationRequest, IntegrationProvider } from '../types/api';
import { logger } from '@core/utils';

export async function getIntegrations(req: Request, res: Response, next: NextFunction) {
  try {
    const tenantId = req.params.id;
    const tenant = await TenantModel.findById(tenantId);
    
    if (!tenant) {
      throw new AppError('Tenant not found', 404);
    }

    // Check if user is owner
    const isOwner = tenant.members.some(m => 
      m.userId === req.user.id && m.role === 'OWNER'
    );

    if (!isOwner) {
      throw new AppError('Only tenant owners can view integrations', 403);
    }

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

    // Check if user is owner
    const isOwner = tenant.members.some(m => 
      m.userId === req.user.id && m.role === 'OWNER'
    );

    if (!isOwner) {
      throw new AppError('Only tenant owners can add integrations', 403);
    }

    // Check if integration already exists
    if (tenant.integrations.some(i => i.provider === provider)) {
      throw new AppError(`Integration with provider ${provider} already exists`, 400);
    }

    tenant.integrations.push({
      provider,
      token,
      connectedAt: new Date()
    });

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

    // Check if user is owner
    const isOwner = tenant.members.some(m => 
      m.userId === req.user.id && m.role === 'OWNER'
    );

    if (!isOwner) {
      throw new AppError('Only tenant owners can delete integrations', 403);
    }

    // Check if integration exists
    const integrationIndex = tenant.integrations.findIndex(i => i.provider === provider);
    if (integrationIndex === -1) {
      throw new AppError(`Integration with provider ${provider} not found`, 404);
    }

    // TODO: Check if any projects are using this integration
    // This will be implemented when project schema is updated to reference integrations

    tenant.integrations.splice(integrationIndex, 1);
    await tenant.save();

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