import { Request, Response, NextFunction } from 'express';
import { TenantModel } from '@models-v2/tenant.model';
import { AppError } from '@core-v2/errors/AppError';

export const requireTenantOwner = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const tenant = await TenantModel.findById(req.params.id);
    
    if (!tenant) {
      throw AppError.notFound('Tenant not found');
    }

    if (tenant.ownerId.toString() !== req.user!._id.toString()) {
      throw AppError.forbidden('Not authorized to access this tenant');
    }

    next();
  } catch (error) {
    next(error);
  }
};