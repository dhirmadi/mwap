# DRY (Don't Repeat Yourself) Principles

## Overview
The DRY principle states that "Every piece of knowledge must have a single, unambiguous, authoritative representation within a system."

## Key Goals

### Reduce Redundancy
- Avoid duplicating code, logic, or data
- Use abstractions (functions, classes, modules) to encapsulate repeated patterns
- Create reusable utilities and middleware
- Use constants and enums for repeated values

### Improve Maintainability
- Changes should only need to be made in one place
- Reduce risk of inconsistencies and bugs
- Make updates safer and more predictable
- Use TypeScript interfaces and types for shared structures

### Enhance Readability
- Keep code clean and focused
- Make intentions clear through good naming
- Use comments to explain "why" not "what"
- Follow consistent patterns across the codebase

### Promote Consistency
- Ensure all uses of logic or data are in sync
- Use shared configurations
- Maintain consistent error handling
- Follow established patterns

### Facilitate Collaboration
- Make code modular and reusable
- Document shared utilities and patterns
- Use clear naming conventions
- Keep related code together

## How to Apply DRY

### Code Organization

#### 1. Shared Types and Interfaces
```typescript
// BAD: Duplicating types
interface UserResponse1 {
  id: string;
  name: string;
}

interface UserResponse2 {
  id: string;
  name: string;
}

// GOOD: Single shared interface
interface UserResponse {
  id: string;
  name: string;
}
```

#### 2. Constants and Configuration
```typescript
// BAD: Magic numbers/strings scattered throughout code
if (size > 1024 * 1024 * 10) { ... }
if (retryCount > 3) { ... }

// GOOD: Centralized configuration
const CONFIG = {
  MAX_UPLOAD_SIZE: 1024 * 1024 * 10,
  MAX_RETRY_COUNT: 3
} as const;
```

#### 3. Utility Functions
```typescript
// BAD: Duplicating error handling logic
try {
  // Operation 1
} catch (error) {
  logger.error('Operation 1 failed', { error });
  throw new AppError(error);
}

try {
  // Operation 2
} catch (error) {
  logger.error('Operation 2 failed', { error });
  throw new AppError(error);
}

// GOOD: Reusable error handler
const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  context: string
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    logger.error(`${context} failed`, { error });
    throw new AppError(error);
  }
};
```

### Middleware and Controllers

#### 1. Reusable Middleware
```typescript
// BAD: Duplicating validation logic
router.post('/users', validateToken, (req, res) => {
  if (!req.user?.id) throw new AuthError();
  // Handler logic
});

router.post('/posts', validateToken, (req, res) => {
  if (!req.user?.id) throw new AuthError();
  // Handler logic
});

// GOOD: Shared middleware
const requireUser = (req, res, next) => {
  if (!req.user?.id) throw new AuthError();
  next();
};

router.post('/users', validateToken, requireUser, handler);
router.post('/posts', validateToken, requireUser, handler);
```

#### 2. Controller Patterns
```typescript
// BAD: Duplicating response formatting
const handler1 = (req, res) => {
  res.json({
    data: result1,
    meta: { requestId: req.id }
  });
};

const handler2 = (req, res) => {
  res.json({
    data: result2,
    meta: { requestId: req.id }
  });
};

// GOOD: Shared response formatter
const sendResponse = (res, data, meta = {}) => {
  res.json({
    data,
    meta: { requestId: req.id, ...meta }
  });
};
```

### Database and Services

#### 1. Model Schemas
```typescript
// BAD: Duplicating schema validation
const schema1 = {
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
};

const schema2 = {
  title: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
};

// GOOD: Shared schema fields
const baseSchema = {
  createdAt: { type: Date, default: Date.now }
};

const schema1 = { ...baseSchema, name: { type: String, required: true } };
const schema2 = { ...baseSchema, title: { type: String, required: true } };
```

#### 2. Service Methods
```typescript
// BAD: Duplicating CRUD operations
class UserService {
  async findById(id: string) {
    return await UserModel.findById(id);
  }
}

class ProjectService {
  async findById(id: string) {
    return await ProjectModel.findById(id);
  }
}

// GOOD: Generic base service
class BaseService<T> {
  constructor(private model: Model<T>) {}
  
  async findById(id: string): Promise<T | null> {
    return await this.model.findById(id);
  }
}

class UserService extends BaseService<User> {
  constructor() {
    super(UserModel);
  }
}
```

## Anti-Patterns to Avoid

### 1. Premature Abstraction
- Don't create abstractions until you see a clear pattern
- Rule of three: Wait until you see something repeated three times
- Keep abstractions focused and purpose-driven

### 2. Over-Generalization
- Don't make things more generic than needed
- Balance reusability with readability
- Consider the maintenance cost of abstractions

### 3. Copy-Paste Programming
- Don't duplicate code just because it's quick
- Take time to understand patterns and create proper abstractions
- Document why code is duplicated when necessary

### 4. Hidden Dependencies
- Don't create implicit dependencies between modules
- Make dependencies clear and explicit
- Use dependency injection when appropriate

## Best Practices

### 1. Code Organization
- Group related functionality together
- Use clear file and folder structure
- Keep abstractions at appropriate levels

### 2. Documentation
- Document shared utilities and patterns
- Explain complex abstractions
- Keep documentation up to date

### 3. Testing
- Test shared code thoroughly
- Use test cases to verify abstractions
- Consider edge cases in shared code

### 4. Maintenance
- Regularly review for opportunities to reduce duplication
- Refactor when patterns emerge
- Keep abstractions simple and focused

## Examples from Our Codebase

### Auth Middleware
```typescript
// Reusable auth chains
export const auth = {
  requireUserAndToken: [
    validateToken,
    extractUser,
    requireUser
  ],
  requireTenantOwner: [
    validateToken,
    extractUser,
    validateTenantRole('owner')
  ]
};
```

### API Response Format
```typescript
// Shared response structure
interface ApiResponse<T> {
  data: T;
  meta: {
    requestId: string;
    timestamp?: string;
    pagination?: PaginationMeta;
  };
}
```

### Error Handling
```typescript
// Centralized error handling
export const errorHandler = (err: Error, req: Request, res: Response) => {
  logger.error(err.message, {
    error: err,
    requestId: req.id,
    path: req.path
  });
  // ... error response formatting
};
```