import { z } from 'zod';

export const InvitesSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(100),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Invites = z.infer<typeof InvitesSchema>;

// Request validation schemas
export const CreateInvitesSchema = InvitesSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateInvitesSchema = InvitesSchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
