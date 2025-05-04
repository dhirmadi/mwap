import { CloudProviderModel } from '@models-v2/cloudProvider.model';
import { CloudProviderCreateSchema, CloudProviderUpdateSchema } from './schema';
import { AppError } from '@core-v2/errors/AppError';
import type { CloudProviderCreate, CloudProviderUpdate } from './schema';

export class CloudProviderService {
  static async createCloudProvider(payload: CloudProviderCreate) {
    const validationResult = CloudProviderCreateSchema.safeParse(payload);
    if (!validationResult.success) {
      throw AppError.badRequest('Invalid input', validationResult.error.format());
    }

    try {
      const provider = new CloudProviderModel(payload);
      await provider.save();
      return provider;
    } catch (error) {
      if ((error as any).code === 11000) {
        throw AppError.badRequest('Provider ID already exists');
      }
      throw error;
    }
  }

  static async listCloudProviders() {
    return CloudProviderModel.find().sort({ name: 1 });
  }

  static async updateCloudProvider(providerId: string, payload: CloudProviderUpdate) {
    const validationResult = CloudProviderUpdateSchema.safeParse(payload);
    if (!validationResult.success) {
      throw AppError.badRequest('Invalid input', validationResult.error.format());
    }

    const provider = await CloudProviderModel.findOneAndUpdate(
      { providerId },
      { ...payload, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!provider) {
      throw AppError.notFound('Cloud provider not found');
    }

    return provider;
  }

  static async deleteCloudProvider(providerId: string) {
    const provider = await CloudProviderModel.findOneAndDelete({ providerId });
    
    if (!provider) {
      throw AppError.notFound('Cloud provider not found');
    }

    return provider;
  }
}