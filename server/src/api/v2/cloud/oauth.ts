import { CloudProviderModel } from '@models-v2/cloudProvider.model';
import { AppError } from '@core-v2/errors/AppError';
import type { User } from '@models-v2/user.model';

export class OAuth2Manager {
  private static generateState(user: User, providerId: string): string {
    return Buffer.from(`${user._id}:${providerId}:${Date.now()}`).toString('base64');
  }

  private static validateState(state: string): { userId: string; providerId: string } {
    try {
      const [userId, providerId] = Buffer.from(state, 'base64')
        .toString()
        .split(':');
      return { userId, providerId };
    } catch (error) {
      throw AppError.badRequest('Invalid OAuth state parameter');
    }
  }

  static async getAuthUrl(providerId: string, user: User): Promise<string> {
    const provider = await CloudProviderModel.findOne({ providerId, archived: false });
    if (!provider || provider.authType !== 'OAuth2') {
      throw AppError.badRequest('Invalid or non-OAuth2 provider');
    }

    const state = this.generateState(user, providerId);
    const params = new URLSearchParams({
      client_id: provider.clientId,
      redirect_uri: provider.redirectUri,
      response_type: 'code',
      state,
      ...provider.configOptions
    });

    return `${provider.configOptions.authUrl}?${params.toString()}`;
  }

  static async exchangeCode(code: string, state: string): Promise<any> {
    const { providerId } = this.validateState(state);
    
    const provider = await CloudProviderModel.findOne({ providerId, archived: false });
    if (!provider || provider.authType !== 'OAuth2') {
      throw AppError.badRequest('Invalid or non-OAuth2 provider');
    }

    // In a real implementation, we would make an HTTP request to the token endpoint
    // For now, return mock tokens
    return {
      access_token: `mock_access_token_${providerId}`,
      refresh_token: `mock_refresh_token_${providerId}`,
      expires_in: 3600
    };
  }
}