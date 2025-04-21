import { Request, Response, NextFunction } from 'express';
import { AppError } from '@core/errors';
import { TenantModel } from '../schemas';
import { IntegrationProvider, validateIntegration } from '../types/api';
import { logger } from '@core/utils';
import { CloudProviderService } from '../services/cloud-provider.service';
import { Document } from 'mongoose';

interface ListFoldersQuery {
  parentId?: string;
  search?: string;
  requestId?: string;
}

export async function listFolders(
  req: Request<{id: string, provider: IntegrationProvider}, unknown, unknown, ListFoldersQuery>,
  res: Response,
  next: NextFunction
) {
  const { id: tenantId, provider } = req.params;
  const { parentId, search, requestId } = req.query;

  try {
    // Log request details
    logger.debug('List folders request', {
      tenantId,
      provider: provider.toLowerCase(),
      parentId,
      search,
      requestId,
      userId: req.user.id
    });

    // Find tenant and verify ownership
    const tenant = await TenantModel.findById(tenantId);
    if (!tenant) {
      throw new AppError('Tenant not found', 404);
    }

    // Check if user is owner
    const isOwner = tenant.members.some(m => 
      m.userId === req.user.id && m.role === 'OWNER'
    );

    if (!isOwner) {
      throw new AppError('Only tenant owners can access cloud folders', 403);
    }

    // Find integration and convert to plain object
    const integration = tenant.integrations.find(i => 
      i.provider.toLowerCase() === provider.toLowerCase()
    );

    if (!integration) {
      throw new AppError(`Integration with provider ${provider} not found`, 404);
    }

    // Convert Mongoose document to plain object and validate
    const rawData = (integration as unknown as Document).toObject();

    // Validate and normalize integration data
    const integrationData = validateIntegration(rawData);

    // Log integration data for debugging
    logger.debug('Integration data for cloud service', {
      tenantId,
      provider: integrationData.provider,
      hasToken: !!integrationData.token,
      connectedAt: integrationData.connectedAt
    });

    // Get cloud provider service
    const cloudService = new CloudProviderService(integrationData, tenantId);
    
    // List folders
    const result = await cloudService.listFolders({
      parentId,
      search
    });

    logger.info('Listed cloud folders', {
      tenantId,
      provider: provider.toLowerCase(),
      parentId,
      search,
      requestId,
      userId: req.user.id,
      folderCount: result.folders.length,
      hasMore: !!result.nextPageToken
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    // Log error details
    logger.error('Failed to list folders', {
      tenantId,
      provider: provider.toLowerCase(),
      parentId,
      search,
      requestId,
      userId: req.user.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    next(error);
  }
}