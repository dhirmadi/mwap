# 👋 MWAP v2 Developer Onboarding

Welcome to MWAP v2! This guide will help you get started with development.

## 📚 Table of Contents

- [Quick Start](#quick-start)
- [Building Features](#building-features)
- [Writing Tests](#writing-tests)
- [Getting Help](#getting-help)

## 🚀 Quick Start

1. **Setup Development Environment**
   ```bash
   git clone https://github.com/dhirmadi/mwap.git
   cd mwap
   npm install
   
   # Start development servers
   npm run dev
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. **Run Tests**
   ```bash
   npm test
   ```

## 🏗️ Building Features

### 1. Create Feature Structure

```bash
mkdir -p server/src/features-v2/your-feature
cd server/src/features-v2/your-feature

# Create standard directories
mkdir controllers services schemas types routes __tests__
```

### 2. Implement Core Components

```typescript
// types/index.ts
export interface YourFeature {
  id: string;
  name: string;
  // ... other properties
}

// schemas/create.ts
import { z } from 'zod';

export const createSchema = z.object({
  name: z.string().min(3),
  // ... other validations
});

// services/your-feature.service.ts
import { Service } from '@core-v2/types';

export class YourFeatureService implements Service {
  constructor(private db: Database) {}
  
  async create(data: CreateDTO): Promise<YourFeature> {
    // Implementation
  }
}

// controllers/your-feature.controller.ts
import { Controller } from '@core-v2/types';

export class YourFeatureController implements Controller {
  constructor(private service: YourFeatureService) {}
  
  create: RequestHandler = async (req, res) => {
    const result = await this.service.create(req.body);
    res.status(201).json({ data: result });
  };
}

// routes/index.ts
import { Router } from 'express';
import { validateRequest } from '@validation-v2/middleware';
import { requireRoles } from '@middleware-v2/auth';

export function createYourFeatureRouter(
  controller: YourFeatureController
): Router {
  const router = Router();
  
  router.post('/',
    requireRoles(['USER']),
    validateRequest(createSchema),
    controller.create
  );
  
  return router;
}
```

### 3. Important: Do Not Use

❌ **Never Use These**:
- Imports from `/legacy/` directory
- `any` type (except in tests)
- Direct database queries in controllers
- Mixing v1/v2 middleware

✅ **Always Use These**:
- TypeScript with strict mode
- Zod for validation
- AppError for errors
- Controller/Service pattern
- Proper RBAC middleware

## ✅ Writing Tests

### 1. Service Tests

```typescript
import { YourFeatureService } from '../services/your-feature.service';

describe('YourFeatureService', () => {
  let service: YourFeatureService;
  
  beforeEach(() => {
    service = new YourFeatureService(mockDb);
  });
  
  it('creates successfully', async () => {
    const result = await service.create(validData);
    expect(result).toMatchObject(expectedData);
  });
  
  it('handles errors', async () => {
    await expect(
      service.create(invalidData)
    ).rejects.toThrow(AppError);
  });
});
```

### 2. Controller Tests

```typescript
import { YourFeatureController } from '../controllers/your-feature.controller';

describe('YourFeatureController', () => {
  let controller: YourFeatureController;
  let mockService: jest.Mocked<YourFeatureService>;
  
  beforeEach(() => {
    mockService = {
      create: jest.fn()
    } as any;
    controller = new YourFeatureController(mockService);
  });
  
  it('handles successful creation', async () => {
    mockService.create.mockResolvedValue(mockData);
    
    const req = mockRequest({ body: validData });
    const res = mockResponse();
    
    await controller.create(req, res);
    
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      data: mockData
    });
  });
});
```

### 3. Test Coverage Requirements

- 85%+ overall coverage
- 100% coverage of error handling
- All RBAC scenarios tested
- Edge cases covered

## 🆘 Getting Help

### 1. Documentation
- [Core v2 Architecture](./core-v2.md)
- [Migration Guide](./migration-checklist.md)
- [API Documentation](./api-v2.md)

### 2. Team Communication
- Slack: #mwap-dev channel
- GitHub: Create issue with "help wanted" label
- Weekly: Dev sync Tuesday 2pm EST

### 3. Common Issues

**Q: Where should I put shared types?**  
A: In `core-v2/types/` if used across features, or in your feature's `types/` if feature-specific.

**Q: How do I handle errors?**  
A: Use `AppError` from `@core-v2/errors`. See [error handling guide](./error-handling.md).

**Q: What's the deployment process?**  
A: See [deployment guide](./deployment.md). TL;DR: PR → Review → Staging → Production.

### 4. Best Practices

1. **Code Organization**
   - One logical feature per directory
   - Clear separation of concerns
   - Consistent file naming

2. **Type Safety**
   - Use TypeScript strict mode
   - Define clear interfaces
   - Avoid type assertions

3. **Testing**
   - Write tests first (TDD)
   - Mock external dependencies
   - Test error cases

4. **Security**
   - Always validate input
   - Use proper RBAC
   - Handle errors gracefully

## 📞 Contact

- Tech Lead: @techLead on Slack
- Product Owner: @productOwner
- DevOps: @devOps

For urgent issues:
1. Post in #mwap-help
2. Tag @mwap-oncall
3. Email support@mwap.dev