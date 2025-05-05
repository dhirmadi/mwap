# 🔄 MWAP v2 Migration Checklist

This document provides a comprehensive checklist for migrating features from v1 to v2 architecture.

## 📋 Migration Requirements

### 1. Directory Structure

- [ ] Feature code lives in `features-v2/`
- [ ] No imports from `/legacy/` directory
- [ ] Follows v2 folder structure:
  ```
  features-v2/your-feature/
  ├── __tests__/          # Tests with 85%+ coverage
  ├── controllers/        # Request handlers
  ├── services/          # Business logic
  ├── schemas/           # Zod validation schemas
  ├── types/            # TypeScript types/interfaces
  └── routes/           # Express routes
  ```

### 2. Code Quality

- [ ] Uses TypeScript with strict mode
- [ ] No any types (except in tests)
- [ ] Implements controller/service pattern
- [ ] Uses dependency injection
- [ ] Returns typed DTOs only
- [ ] Has error handling via AppError

### 3. Validation & Security

- [ ] Uses `validateRequest` middleware
- [ ] Has Zod schemas for all inputs
- [ ] Implements proper RBAC
- [ ] Uses project/tenant scoping
- [ ] Rate limiting configured

### 4. Testing

- [ ] Unit tests for services
- [ ] Integration tests for controllers
- [ ] 85%+ coverage overall
- [ ] Tests error cases
- [ ] Mock external services

### 5. Documentation

- [ ] API endpoints documented
- [ ] Types and interfaces documented
- [ ] Example usage provided
- [ ] Error codes listed

## 🚀 Migration Process

1. **Preparation**
   ```bash
   # Create new feature directory
   mkdir -p server/src/features-v2/your-feature
   
   # Copy relevant tests
   cp -r server/src/features/your-feature/__tests__ server/src/features-v2/your-feature/
   ```

2. **Implementation**
   ```typescript
   // Controller pattern
   export class YourController {
     constructor(private service: YourService) {}
     
     create: RequestHandler = async (req, res) => {
       const result = await this.service.create(req.body);
       res.status(201).json({ data: result });
     };
   }
   
   // Service pattern
   export class YourService {
     constructor(private db: Database) {}
     
     async create(data: CreateDTO): Promise<ResponseDTO> {
       // Implementation
     }
   }
   ```

3. **Validation**
   ```typescript
   // schemas/create.ts
   export const createSchema = z.object({
     name: z.string().min(3),
     type: z.enum(['TYPE_A', 'TYPE_B']),
     settings: z.object({
       isEnabled: z.boolean()
     })
   });
   
   // routes/index.ts
   router.post('/',
     validateRequest(createSchema),
     controller.create
   );
   ```

4. **Testing**
   ```typescript
   describe('YourService', () => {
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

## 🔍 Verification Steps

1. **Code Review**
   - [ ] No v1 imports remain
   - [ ] All TODOs addressed
   - [ ] Error handling complete
   - [ ] Types properly exported

2. **Testing**
   - [ ] All tests pass
   - [ ] Coverage meets threshold
   - [ ] Edge cases covered
   - [ ] Error paths tested

3. **Documentation**
   - [ ] API docs updated
   - [ ] Breaking changes noted
   - [ ] Migration guide if needed

4. **Security**
   - [ ] Auth properly implemented
   - [ ] RBAC configured
   - [ ] Rate limits set
   - [ ] Input validation complete

## 🚫 Common Pitfalls

1. **Avoid These Patterns**
   - Importing from legacy modules
   - Using any type
   - Skipping validation
   - Mixing v1/v2 middleware

2. **Security Issues**
   - Missing role checks
   - Incomplete validation
   - Exposing internal types
   - Insufficient error handling

3. **Performance Issues**
   - N+1 queries
   - Missing indexes
   - Large response payloads
   - Unnecessary data fetching

## 🔒 How to Deprecate v1 Safely

1. **Mark as Deprecated**
   ```typescript
   /** @deprecated Use v2 endpoint instead */
   export function legacyFunction() {
     // Implementation
   }
   ```

2. **Add Warning Response**
   ```typescript
   router.use('/api/v1/*', (req, res, next) => {
     res.set('Deprecation', 'true');
     res.set('Sunset', '2024-12-31');
     next();
   });
   ```

3. **Monitor Usage**
   - Track v1 endpoint calls
   - Alert on high usage
   - Contact active users
   - Set end-of-life date

4. **Communication Plan**
   - Announce deprecation
   - Document migration path
   - Provide v2 examples
   - Set clear timeline

## 📈 Migration Status Tracking

| Feature | Status | Breaking Changes | Timeline |
|---------|--------|-----------------|-----------|
| Auth    | ✅ Done | New token format| Complete |
| Projects| 🏗️ WIP  | New role system | Q2 2024  |
| Tenants | 📅 Todo | -              | Q3 2024  |

## 🤝 Need Help?

- Check [core-v2.md](./core-v2.md) for architecture details
- Join #mwap-migration Slack channel
- Create GitHub issue with "v2-migration" label
- Email support@mwap.dev