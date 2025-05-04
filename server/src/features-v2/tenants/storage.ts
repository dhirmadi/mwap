import { z } from 'zod';
import { StorageProvider } from '../../providers-v2';

export const StorageTokenSchema = z.object({
  provider: StorageProvider,
  token: z.string(),
  refreshToken: z.string().optional(),
  expiresAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type StorageToken = z.infer<typeof StorageTokenSchema>;

export const TenantStorageSchema = z.object({
  tenantId: z.string().uuid(),
  tokens: z.array(StorageTokenSchema),
});

export type TenantStorage = z.infer<typeof TenantStorageSchema>;

export function getStorageToken(storage: TenantStorage, provider: StorageProvider): string {
  const token = storage.tokens.find(t => t.provider === provider);
  if (!token) {
    throw new Error(`No token found for provider ${provider}`);
  }
  if (token.expiresAt && token.expiresAt < new Date()) {
    throw new Error(`Token for provider ${provider} has expired`);
  }
  return token.token;
}