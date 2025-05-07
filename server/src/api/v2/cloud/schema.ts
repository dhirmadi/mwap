import { z } from 'zod';

export const StartOAuthSchema = z.object({
  providerId: z.string().min(1, 'Provider ID is required')
});

export const CompleteOAuthSchema = z.object({
  code: z.string().min(1, 'Authorization code is required'),
  state: z.string().min(1, 'State parameter is required')
});

export const ListFoldersSchema = z.object({
  provider: z.string().min(1, 'Provider ID is required'),
  token: z.string().min(1, 'Access token is required'),
  path: z.string().optional()
});

export type StartOAuthInput = z.infer<typeof StartOAuthSchema>;
export type CompleteOAuthInput = z.infer<typeof CompleteOAuthSchema>;
export type ListFoldersInput = z.infer<typeof ListFoldersSchema>;