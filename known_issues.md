# Known Issues and Solutions

## 🔒 Authentication & Authorization

### Super Admin Access
- ✅ **Fixed**: Super admin status was previously inferred from tenant roles
- ✅ **Solution**: Now using dedicated `superadmins` collection in MongoDB
- ✅ **Verification**: Check `/api/me` endpoint response for `isSuperAdmin` flag

### Tenant Access
- ⚠️ **Issue**: Tenant role switching might cause stale localStorage data
- 💡 **Workaround**: Clear localStorage and re-login if tenant access issues occur
- 🔄 **Status**: Being monitored

## 🖥️ Frontend

### React Components
- ⚠️ **Issue**: Some components might show brief unauthorized content flash
- ✅ **Fixed**: Added loading states in `RequireSuperAdmin` component
- 🔄 **Status**: Monitoring for edge cases

### Type Safety
- ⚠️ **Issue**: Some API responses lack complete TypeScript coverage
- 🔄 **Status**: Ongoing improvements to type definitions
- 📝 **Todo**: Add more comprehensive interface definitions

## 🔌 Backend

### Database
- ✅ **Fixed**: MongoDB connection handling in review apps
- ✅ **Fixed**: Removed unnecessary seed functionality
- 📝 **Note**: Super admin is now manually seeded

### API Endpoints
- ⚠️ **Issue**: Some endpoints might return stale tenant data
- 💡 **Workaround**: Implement proper cache invalidation
- 🔄 **Status**: Under investigation

## 🚀 Deployment

### Review Apps
- ✅ **Fixed**: Server startup issues in review apps
- ✅ **Fixed**: Environment variable handling
- ✅ **Fixed**: Removed problematic seed functionality

### Environment Variables
- ⚠️ **Issue**: Some variables might be undefined in certain environments
- 💡 **Workaround**: Added better error handling and defaults
- 📝 **Todo**: Add environment variable validation

## 🧪 Testing

### Coverage Gaps
- ⚠️ **Issue**: Limited test coverage for new features
- 📝 **Todo**: Add tests for super admin functionality
- 📝 **Todo**: Add integration tests for tenant management

## 📚 Documentation

### API Documentation
- ⚠️ **Issue**: Some new endpoints lack detailed documentation
- 📝 **Todo**: Update API documentation with new endpoints
- 📝 **Todo**: Add examples for super admin routes

### TypeScript Types
- ⚠️ **Issue**: Some type definitions need updates
- 📝 **Todo**: Document type system changes
- 📝 **Todo**: Add more type safety examples