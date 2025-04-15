# Deployment Guide

## 🚀 Deployment Environments

### Review Apps
- Automatically created for each branch
- Name pattern: `mwap-{branchname}-{unique-id}`
- Used for testing and validation
- Access logs: `heroku logs --tail --app mwap-{branchname}-{unique-id}`

### Staging
- Branch: `staging`
- Used for pre-production testing
- Full integration testing

### Production
- Branch: `main`
- Production environment
- Strict deployment controls

## 🛠️ Build Configuration

### TypeScript Setup

1. **Production Build (tsconfig.prod.json)**
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "sourceMap": false,
    "declaration": false,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*.ts"],
  "exclude": [
    "node_modules",
    "**/*.test.ts",
    "**/*.spec.ts",
    "src/__tests__/**/*"
  ]
}
```

2. **Package Scripts**
```json
{
  "scripts": {
    "start": "node dist/index.js",
    "build:prod": "npm run clean && tsc -p tsconfig.prod.json",
    "prestart": "npm run build:prod"
  }
}
```

### Heroku Configuration

1. **Procfile**
```
web: export NODE_OPTIONS="--max-old-space-size=512" && cd client && rm -rf dist node_modules && npm install && npm run build && cd ../server && rm -rf dist node_modules && npm install && cd /app/server && NODE_ENV=production npm start
```

2. **Environment Variables**
- `NODE_ENV`: Set to 'production'
- `NODE_OPTIONS`: Set memory limit
- Other environment-specific variables

## 🔍 Monitoring and Debugging

### Logs
```bash
# View logs
heroku logs --tail --app <app-name>

# Filter logs
heroku logs --tail --app <app-name> | grep ERROR
```

### Common Issues

1. **Memory Issues (R14)**
- Symptom: `Error R14 (Memory quota exceeded)`
- Solution: 
  - Set `NODE_OPTIONS="--max-old-space-size=512"`
  - Monitor memory usage
  - Optimize build process

2. **TypeScript Build Errors**
- Keep test files separate
- Use proper type definitions
- Handle middleware types correctly

3. **Deployment Failures**
- Check build logs
- Verify environment variables
- Check dependency installation

## 🔒 Error Handling

### Middleware Setup
```typescript
// Error handler middleware
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // Log error
  console.error('Error:', {
    name: err.name,
    message: err.message,
    path: req.path,
    method: req.method,
  });

  // Send response and continue
  res.status(500).json({ error: 'Internal Server Error' });
  return next();
};
```

### Best Practices
1. Always call next() after sending responses
2. Use proper TypeScript types
3. Log errors with context
4. Handle different error types appropriately

## 📊 Performance Monitoring

### Metrics to Track
1. Memory usage
2. Response times
3. Error rates
4. Build times

### Tools
1. Heroku metrics
2. Custom logging
3. Performance monitoring (planned)

## 🔄 Deployment Process

1. **Code Push**
   - Push to feature branch
   - Review app created automatically

2. **Testing**
   - Check review app logs
   - Run integration tests
   - Verify functionality

3. **Staging**
   - Merge to staging branch
   - Verify in staging environment

4. **Production**
   - Merge to main branch
   - Monitor deployment
   - Verify functionality

## 🏷️ Version Management

### Tags
- Use semantic versioning
- Tag significant releases
- Document changes in tag messages

Example:
```bash
git tag -a "v1.0.0" -m "Production release with tenant management"
git push origin v1.0.0
```

## 📝 Documentation Updates

### Required Updates
1. Update deployment status in project_status.md
2. Document new environment variables
3. Update build instructions
4. Add debugging tips

### Version History
Keep track of significant changes:
```markdown
- v2.0.0: Added tenant management
- v1.1.0: Added error handling
- v1.0.0: Initial release
```