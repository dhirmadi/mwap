# Project Invites

## Overview

The Invite system manages user invitations to projects and tenants. It provides secure, time-limited access tokens and handles the complete invitation workflow from creation to acceptance.

## Features

### Invite Management
- Create project invites
- Create tenant invites
- Set invite expiration
- Track invite status

### Invite Types
- Project member invites
- Tenant member invites
- Role-specific invites
- Multi-use invites

### Invite Workflow
- Create invitation
- Send notification
- Verify and accept
- Add member access

## Implementation (V2)

### Data Model
```typescript
import { z } from 'zod';

export const InviteSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['PROJECT', 'TENANT']),
  resourceId: z.string().uuid(),
  role: z.string(),
  email: z.string().email(),
  token: z.string(),
  status: z.enum(['PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED']),
  createdBy: z.string().uuid(),
  createdAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
  acceptedAt: z.string().datetime().optional(),
  metadata: z.object({
    resourceName: z.string(),
    inviterName: z.string(),
    customMessage: z.string().optional()
  })
});

export type Invite = z.infer<typeof InviteSchema>;
```

### Service Layer
```typescript
export class InviteService {
  constructor(
    private repo: InviteRepository,
    private emailService: EmailService,
    private tokenService: TokenService
  ) {}

  async createInvite(data: CreateInviteDTO): Promise<Invite> {
    // Validate resource exists
    await this.validateResource(data.type, data.resourceId);

    // Check if invite already exists
    const existing = await this.repo.findPendingInvite({
      email: data.email,
      resourceId: data.resourceId
    });
    if (existing) {
      throw AppError.conflict('Invite already exists');
    }

    // Generate secure token
    const token = await this.tokenService.generate();

    // Create invite
    const invite = await this.repo.create({
      ...data,
      token,
      status: 'PENDING',
      expiresAt: this.calculateExpiry(),
      metadata: await this.getResourceMetadata(data)
    });

    // Send invitation email
    await this.emailService.sendInvite({
      to: data.email,
      token: token,
      metadata: invite.metadata
    });

    return invite;
  }

  async acceptInvite(token: string): Promise<void> {
    // Find and validate invite
    const invite = await this.repo.findByToken(token);
    if (!invite) {
      throw AppError.notFound('Invite not found');
    }

    if (invite.status !== 'PENDING') {
      throw AppError.validation('Invite is no longer valid');
    }

    if (new Date() > new Date(invite.expiresAt)) {
      throw AppError.validation('Invite has expired');
    }

    // Add member to resource
    if (invite.type === 'PROJECT') {
      await this.projectService.addMember(
        invite.resourceId,
        invite.email,
        invite.role
      );
    } else {
      await this.tenantService.addMember(
        invite.resourceId,
        invite.email,
        invite.role
      );
    }

    // Update invite status
    await this.repo.update(invite.id, {
      status: 'ACCEPTED',
      acceptedAt: new Date().toISOString()
    });
  }

  private calculateExpiry(): string {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 7); // 7 days
    return expiry.toISOString();
  }
}
```

### API Routes
```typescript
export function createInviteRouter(): Router {
  const router = Router();
  const controller = new InviteController(new InviteService());

  router.post('/',
    extractUser(),
    requireRoles(['OWNER', 'DEPUTY']),
    validateRequest(createInviteSchema),
    controller.createInvite
  );

  router.post('/accept',
    validateRequest(acceptInviteSchema),
    controller.acceptInvite
  );

  router.post('/:id/revoke',
    extractUser(),
    requireRoles(['OWNER', 'DEPUTY']),
    validateRequest(revokeInviteSchema),
    controller.revokeInvite
  );

  return router;
}
```

## Security

### Token Security
- Secure token generation
- Limited token lifetime
- One-time use
- Token revocation

### Access Control
- Role-based invite creation
- Email verification
- Resource access validation
- Audit logging

## Testing

### Integration Tests
```typescript
describe('InviteAPI', () => {
  let app: Express;
  let testDb: TestDatabase;
  let emailService: MockEmailService;

  beforeAll(async () => {
    testDb = await createTestDatabase();
    emailService = new MockEmailService();
    app = createTestApp(testDb, emailService);
  });

  it('should create and send invite', async () => {
    const response = await request(app)
      .post('/api/v2/invites')
      .set('Authorization', `Bearer ${testToken}`)
      .send(createTestInviteData());

    expect(response.status).toBe(201);
    expect(emailService.sendInvite).toHaveBeenCalled();
  });

  it('should accept valid invite', async () => {
    const invite = await createTestInvite(testDb);

    const response = await request(app)
      .post('/api/v2/invites/accept')
      .send({ token: invite.token });

    expect(response.status).toBe(200);
    expect(await testDb.getMember(invite.resourceId)).toBeDefined();
  });
});
```

## Error Handling

Common errors:
- Invalid token
- Expired invite
- Already accepted
- Resource not found
- Permission denied
- Email delivery failure

## Migration Guide

When migrating from v1:

1. Update invite model
2. Implement token service
3. Add email templates
4. Update routes
5. Add new tests
6. Migrate existing invites

## Best Practices

1. Validate all inputs
2. Use secure tokens
3. Set reasonable expiry
4. Handle all edge cases
5. Maintain audit trail
6. Monitor email delivery