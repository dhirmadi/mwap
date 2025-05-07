import { z } from 'zod';
import { Types } from 'mongoose';
import { ProjectRole } from '../../../features/projects/types/roles';

// Helper function to validate ObjectId
const isValidObjectId = (value: string) => Types.ObjectId.isValid(value);

// Email validation regex
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Base schema for common validations
const baseInviteSchema = {
  projectId: z.string().refine(isValidObjectId, {
    message: 'Invalid project ID format'
  }),
  email: z.string().email().regex(emailRegex, {
    message: 'Invalid email format'
  }).toLowerCase().trim(),
  role: z.nativeEnum(ProjectRole)
};

// Schema for creating a new invite
export const InviteCreateSchema = z.object({
  ...baseInviteSchema,
  expiresAt: z.date().min(new Date(), {
    message: 'Expiration date must be in the future'
  }).optional()
});

// Schema for redeeming an invite
export const InviteRedeemSchema = z.object({
  code: z.string().trim().min(1, {
    message: 'Invite code is required'
  })
});

// Export types for TypeScript
export type InviteCreate = z.infer<typeof InviteCreateSchema>;
export type InviteRedeem = z.infer<typeof InviteRedeemSchema>;