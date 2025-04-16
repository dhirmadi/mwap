import mongoose, { Types } from 'mongoose';
import { TenantModel, TenantDocument, TenantRole } from '../schemas';
import { ProjectModel } from '@features/projects/schemas';
import { CreateTenantInput, UpdateTenantInput } from '../types';
import { 
  NotFoundError, 
  ValidationError, 
  ConflictError, 
  InternalServerError 
} from '@core/errors';
import { logger } from '@core/utils';

export class TenantService {
  /**
   * Create a new tenant
   */
  async createTenant(userId: string, input: CreateTenantInput) {
    const startTime = Date.now();
    try {
      logger.info('Creating tenant - Service called', { 
        userId,
        input,
        timestamp: new Date().toISOString(),
        mongooseVersion: mongoose.version,
        nodeEnv: process.env.NODE_ENV
      });

      // Check MongoDB connection
      const dbState = mongoose.connection.readyState;
      if (dbState !== 1) {
        const stateMap = {
          0: 'disconnected',
          1: 'connected',
          2: 'connecting',
          3: 'disconnecting',
          99: 'uninitialized'
        };
        logger.error('MongoDB not connected', {
          readyState: dbState,
          readyStateText: stateMap[dbState],
          host: mongoose.connection.host,
          name: mongoose.connection.name,
          models: Object.keys(mongoose.models),
          collections: Object.keys(mongoose.connection.collections)
        });
        throw new InternalServerError('Database connection error');
      }

      logger.debug('Checking for existing tenant', {
        userId,
        query: {
          'members.userId': userId,
          'members.role': TenantRole.OWNER,
          archived: false
        }
      });

      const existingTenant = await TenantModel.findOne({ 
        'members.userId': userId,
        'members.role': TenantRole.OWNER,
        archived: false
      }).lean();

      if (existingTenant) {
        logger.warn('User already has a tenant', {
          userId,
          existingTenantId: existingTenant._id,
          existingTenantName: existingTenant.name,
          memberCount: existingTenant.members?.length,
          createdAt: existingTenant.createdAt
        });
        throw new ConflictError('User already has an active tenant');
      }

      logger.debug('Creating new tenant document', {
        userId,
        name: input.name,
        timestamp: new Date().toISOString()
      });

      const tenant = new TenantModel({
        ...input,
        members: [{
          userId,
          role: TenantRole.OWNER,
          joinedAt: new Date()
        }]
      });

      // Validate document before saving
      const validationError = tenant.validateSync();
      if (validationError) {
        logger.error('Tenant validation failed', {
          errors: validationError.errors,
          document: tenant.toObject()
        });
        throw new ValidationError('Invalid tenant data', { errors: validationError.errors });
      }

      // Log the document before saving
      logger.debug('Tenant document ready for save', {
        document: tenant.toObject(),
        userId,
        schema: Object.keys(TenantModel.schema.paths)
      });

      const savedTenant = await tenant.save();
      
      const endTime = Date.now();
      logger.info('Tenant saved successfully', {
        tenantId: savedTenant._id,
        userId,
        name: savedTenant.name,
        memberCount: savedTenant.members.length,
        timestamp: new Date().toISOString(),
        duration: endTime - startTime + 'ms'
      });

      return savedTenant;
    } catch (error) {
      const endTime = Date.now();
      if (error instanceof ValidationError || error instanceof ConflictError) {
        throw error;
      }
      const metadata = error instanceof Error ? 
        { 
          name: error.name,
          message: error.message,
          stack: error.stack,
          userId,
          input,
          duration: endTime - startTime + 'ms',
          mongooseError: error instanceof mongoose.Error ? {
            name: error.constructor.name,
            validationErrors: (error as any).errors,
            code: (error as any).code
          } : undefined
        } : { error };
      logger.error('Failed to create tenant in service', metadata);
      throw new InternalServerError('Failed to create tenant', metadata);
    }
  }

  /**
   * Get tenant by ID
   */
  async getTenantById(tenantId: string) {
    try {
      if (!Types.ObjectId.isValid(tenantId)) {
        throw new ValidationError('Invalid tenant ID');
      }

      const tenant = await TenantModel.findOne({
        _id: new Types.ObjectId(tenantId),
        archived: false
      });

      if (!tenant) {
        throw new NotFoundError('Tenant not found');
      }

      return tenant;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }
      const metadata = error instanceof Error ? 
        { message: error.message, stack: error.stack } : 
        { error };
      logger.error('Failed to get tenant', metadata);
      throw new InternalServerError('Failed to get tenant', metadata);
    }
  }

  /**
   * Update tenant
   */
  async updateTenant(tenantId: string, input: UpdateTenantInput) {
    try {
      if (!Types.ObjectId.isValid(tenantId)) {
        throw new ValidationError('Invalid tenant ID');
      }

      const tenant = await TenantModel.findOneAndUpdate(
        {
          _id: new Types.ObjectId(tenantId),
          archived: false
        },
        { $set: input },
        { new: true, runValidators: true }
      );

      if (!tenant) {
        throw new NotFoundError('Tenant not found');
      }

      return tenant;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }
      const metadata = error instanceof Error ? 
        { message: error.message, stack: error.stack } : 
        { error };
      logger.error('Failed to update tenant', metadata);
      throw new InternalServerError('Failed to update tenant', metadata);
    }
  }

  /**
   * Archive tenant and cascade to projects
   */
  async archiveTenant(tenantId: string) {
    try {
      if (!Types.ObjectId.isValid(tenantId)) {
        throw new ValidationError('Invalid tenant ID');
      }

      // Start a session for transaction
      const session = await TenantModel.startSession();
      let archivedTenant;

      try {
        await session.withTransaction(async () => {
          // Archive tenant
          archivedTenant = await TenantModel.findOneAndUpdate(
            {
              _id: new Types.ObjectId(tenantId),
              archived: false
            },
            { $set: { archived: true } },
            { new: true, session }
          );

          if (!archivedTenant) {
            throw new NotFoundError('Tenant not found');
          }

          // Archive all projects belonging to this tenant
          await ProjectModel.updateMany(
            { tenantId: new Types.ObjectId(tenantId) },
            { $set: { archived: true } },
            { session }
          );

          logger.debug('Archived tenant and associated projects', {
            tenantId,
            tenantName: archivedTenant.name
          });
        });
      } finally {
        await session.endSession();
      }

      return archivedTenant!;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }
      const metadata = error instanceof Error ? 
        { message: error.message, stack: error.stack } : 
        { error };
      logger.error('Failed to archive tenant', metadata);
      throw new InternalServerError('Failed to archive tenant', metadata);
    }
  }

  /**
   * Add member to tenant
   */
  async addMember(tenantId: string, userId: string, role: string) {
    try {
      if (!Types.ObjectId.isValid(tenantId)) {
        throw new ValidationError('Invalid tenant ID');
      }

      const tenant = await TenantModel.findOne({
        _id: new Types.ObjectId(tenantId),
        archived: false
      });

      if (!tenant) {
        throw new NotFoundError('Tenant not found');
      }

      // Check if user is already a member
      if (tenant.members.some(member => member.userId === userId)) {
        throw new ConflictError('User is already a member of this tenant');
      }

      // Validate role
      if (!Object.values(TenantRole).includes(role as TenantRole)) {
        throw new ValidationError('Invalid role. Must be one of: OWNER, ADMIN, MEMBER');
      }

      tenant.members.push({ 
        userId, 
        role: role as TenantRole,
        joinedAt: new Date()
      });
      await tenant.save();

      return tenant;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError || error instanceof ConflictError) {
        throw error;
      }
      const metadata = error instanceof Error ? 
        { message: error.message, stack: error.stack } : 
        { error };
      logger.error('Failed to add member to tenant', metadata);
      throw new InternalServerError('Failed to add member to tenant', metadata);
    }
  }

  /**
   * Remove member from tenant
   */
  async removeMember(tenantId: string, userId: string) {
    try {
      if (!Types.ObjectId.isValid(tenantId)) {
        throw new ValidationError('Invalid tenant ID');
      }

      const tenant = await TenantModel.findOne({
        _id: new Types.ObjectId(tenantId),
        archived: false
      });

      if (!tenant) {
        throw new NotFoundError('Tenant not found');
      }

      // Check if user is a member
      const memberIndex = tenant.members.findIndex(member => member.userId === userId);
      if (memberIndex === -1) {
        throw new NotFoundError('User is not a member of this tenant');
      }

      // Don't allow removing the owner
      if (tenant.members[memberIndex].role === TenantRole.OWNER) {
        throw new ValidationError('Cannot remove tenant owner');
      }

      tenant.members.splice(memberIndex, 1);
      await tenant.save();

      return tenant;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }
      const metadata = error instanceof Error ? 
        { message: error.message, stack: error.stack } : 
        { error };
      logger.error('Failed to remove member from tenant', metadata);
      throw new InternalServerError('Failed to remove member from tenant', metadata);
    }
  }

  /**
   * Get tenant by owner ID
   */
  async getTenantByOwnerId(ownerId: string): Promise<TenantDocument | null> {
    try {
      if (!Types.ObjectId.isValid(ownerId)) {
        throw new ValidationError('Invalid owner ID');
      }

      const tenant = await TenantModel.findOne({
        ownerId: new Types.ObjectId(ownerId),
        archived: false
      });

      return tenant;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      const metadata = error instanceof Error ? 
        { message: error.message, stack: error.stack } : 
        { error };
      logger.error('Failed to get tenant by owner ID', metadata);
      throw new InternalServerError('Failed to get tenant by owner ID', metadata);
    }
  }
}