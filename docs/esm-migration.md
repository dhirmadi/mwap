# ESM and TypeScript Migration Documentation

## Overview

This document details the migration of the MWAP backend from CommonJS to ECMAScript Modules (ESM) and completion of TypeScript adoption.

## Changes Made

### 1. Package.json Configuration
```json
{
  "type": "module",
  "main": "src/index.ts",
  "scripts": {
    "start": "node --loader ts-node/esm src/index.ts",
    "dev": "nodemon --exec node --loader ts-node/esm src/index.ts",
    "build": "tsc",
    "lint": "eslint . --ext .ts"
  }
}
```
- Added `"type": "module"` to enable ESM
- Updated entry point to TypeScript file
- Modified scripts to use ts-node/esm loader
- Added TypeScript-specific build and lint commands

### 2. File Conversions

#### A. index.js → index.ts
```typescript
// Old (CommonJS):
require('dotenv').config();
const express = require('express');
const routes = require('./routes');

// New (ESM + TypeScript):
import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import { fileURLToPath } from 'url';
import routes from './routes/index.js';

// ESM __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
```

#### B. auth.js → auth.ts
```typescript
// Old (CommonJS):
const { auth } = require('express-oauth2-jwt-bearer');
module.exports = { checkJwt };

// New (ESM + TypeScript):
import { auth } from 'express-oauth2-jwt-bearer';
import { Request } from 'express';

export interface AuthRequest extends Request {
  auth?: {
    sub: string;
    [key: string]: any;
  };
}

export const checkJwt = auth({...});
```

#### C. users.js/users.ts Consolidation
- Removed redundant users.js
- Updated users.ts to use ESM imports:
```typescript
import express, { Request, Response } from 'express';
import { checkJwt, AuthRequest } from '../middleware/auth.js';
import { User } from '../models/user.model.js';
// ... other imports

export default router;
```

### 3. File Extensions
- Added `.js` extensions to all imports (required for ESM)
- Renamed files to `.ts` extension where appropriate
- Maintained `.ts` extension for existing TypeScript files

### 4. Type Definitions
- Added interface for Auth0 request:
```typescript
export interface AuthRequest extends Request {
  auth?: {
    sub: string;
    [key: string]: any;
  };
}
```
- Preserved existing TypeScript types in tenant.controller.ts

## Known Issues and TODOs

### 1. Module Conversion
- Some modules still need ESM conversion:
  - ./config/db.js
  - ./config/environment.js
  - ./middleware/security.js
  - ./middleware/errors.js

### 2. Type Safety
- Need to add comprehensive type definitions for:
  - Express middleware functions
  - Configuration objects
  - Database models
  - API responses

### 3. Build Process
- May need to update tsconfig.json for ESM
- Need to verify production build process
- Consider adding source maps for debugging

### 4. Third-Party Packages
- Verify ESM compatibility of all dependencies
- Some packages may need ESM-specific configuration
- Consider alternatives for packages without ESM support

## Migration Impact

### Benefits
1. **Modern JavaScript Features**
   - Native async/await support
   - Top-level await
   - Import assertions

2. **Better Type Safety**
   - Full TypeScript integration
   - Better IDE support
   - Improved error catching

3. **Code Quality**
   - Consistent module system
   - Better code organization
   - Improved maintainability

### Potential Issues
1. **Compatibility**
   - Some packages might not support ESM
   - Need to handle __dirname differently
   - May need polyfills for certain features

2. **Development Workflow**
   - Different debugging setup needed
   - Build process changes
   - New testing considerations

## Next Steps

1. **Immediate Tasks**
   - Convert remaining CommonJS modules
   - Add missing type definitions
   - Update build configuration

2. **Testing Requirements**
   - Verify all routes work with ESM
   - Test build process
   - Check third-party integrations

3. **Documentation Updates**
   - Update API documentation
   - Add type usage examples
   - Document new build process

## References

- [Node.js ESM Documentation](https://nodejs.org/api/esm.html)
- [TypeScript ESM Support](https://www.typescriptlang.org/docs/handbook/esm-node.html)
- [Express.js TypeScript Guide](https://expressjs.com/en/guide/typescript.html)

## Support

For any issues during the migration:
1. Check the error message for missing .js extensions
2. Verify import/export syntax
3. Ensure all path aliases are properly configured
4. Check for CommonJS specific code patterns