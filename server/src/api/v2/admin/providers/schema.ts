import { z } from 'zod';
import type { AuthType } from '@models/v2/cloudProvider.model';

const kebabCaseRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const urlRegex = /^https?:\/\/.+/;

const authTypeEnum = z.enum(['OAuth2', 'APIKey']);

// Base schema for common fields
const baseSchema = {
  providerId: z
    .string()
    .min(1, 'Provider ID is required')
    .regex(kebabCaseRegex, 'Provider ID must be in kebab-case format'),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name cannot exceed 100 characters'),
  authType: authTypeEnum,
  configOptions: z
    .record(z.unknown())
    .optional()
};

// OAuth2-specific fields
const oauth2Fields = {
  clientId: z.string().min(1, 'Client ID is required for OAuth2'),
  clientSecret: z.string().min(1, 'Client Secret is required for OAuth2'),
  redirectUri: z
    .string()
    .regex(urlRegex, 'Redirect URI must be a valid URL')
};

export const CloudProviderCreateSchema = z
  .object({
    ...baseSchema,
    ...oauth2Fields
  })
  .refine(
    (data) => {
      if (data.authType === 'OAuth2') {
        return data.clientId && data.clientSecret && data.redirectUri;
      }
      return true;
    },
    {
      message: 'OAuth2 providers require clientId, clientSecret, and redirectUri',
      path: ['authType']
    }
  );

export const CloudProviderUpdateSchema = CloudProviderCreateSchema.partial();

export type CloudProviderCreate = z.infer<typeof CloudProviderCreateSchema>;
export type CloudProviderUpdate = z.infer<typeof CloudProviderUpdateSchema>;