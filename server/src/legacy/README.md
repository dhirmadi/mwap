# ⚠️ Legacy Code (Deprecated)

This directory contains deprecated v1 code that should not be imported into v2 modules.

## 🚫 Do Not Import

The code in this directory is maintained only for backward compatibility and will be removed in future releases. All new code should use the following v2 modules instead:

- Use `core-v2` instead of `legacy/core`
- Use `features-v2` instead of `legacy/features`
- Use `middleware-v2` instead of `legacy/middleware`

## 🔄 Migration

If you need functionality from these modules:

1. Check if an equivalent exists in the v2 modules
2. If not, copy the needed code to the appropriate v2 module
3. Update the code to follow v2 patterns and conventions
4. Add proper tests following v2 test coverage requirements

## 📅 Removal Timeline

These modules will be completely removed when:
1. All active projects have migrated to v2 APIs
2. No production traffic hits v1 endpoints for 30 days
3. All v1 database records are archived or migrated