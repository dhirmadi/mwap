# Contributing Guidelines

## Introduction

Thank you for considering contributing to MWAP! This document provides guidelines and standards for contributing to the project.

## Code of Conduct

### Our Standards
- Be respectful and inclusive
- Accept constructive criticism
- Focus on what's best for the community
- Show empathy towards others

### Unacceptable Behavior
- Harassment or discrimination
- Trolling or insulting comments
- Publishing others' private information
- Other unprofessional conduct

## How to Contribute

### 1. Finding Issues
- Check the issue tracker
- Look for "good first issue" label
- Review project roadmap
- Discuss new features

### 2. Making Changes

#### Branch Naming
```
type/description

Types:
- feature/   (new features)
- bugfix/    (bug fixes)
- hotfix/    (urgent fixes)
- docs/      (documentation)
- refactor/  (code improvements)
- test/      (testing)
```

Example: `feature/add-user-profile`

#### Commit Messages
```
type(scope): description

[optional body]

[optional footer]
```

Example:
```
feat(auth): Add role-based access control

- Implement role hierarchy
- Add permission checks
- Update documentation

Closes #123
```

### 3. Code Standards

#### TypeScript
- Use strict mode
- Proper type annotations
- No any types
- Document complex logic
- Write unit tests

Example:
```typescript
/**
 * Checks if user has required role or higher
 * @param userRole Current user's role
 * @param requiredRole Required role level
 * @returns boolean indicating if user has sufficient permissions
 */
function hasHigherOrEqualRole(
  userRole: TenantRole,
  requiredRole: TenantRole
): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}
```

#### React Components
- Functional components
- Proper prop types
- Custom hooks
- Error boundaries
- Performance optimization

Example:
```typescript
interface ProjectCardProps {
  project: Project;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onEdit,
  onDelete
}) => {
  // Component implementation
};
```

### 4. Testing

#### Unit Tests
- Test business logic
- Mock external services
- Check edge cases
- Maintain coverage

Example:
```typescript
describe('hasHigherOrEqualRole', () => {
  it('should return true for higher role', () => {
    expect(hasHigherOrEqualRole(TenantRole.OWNER, TenantRole.ADMIN))
      .toBe(true);
  });

  it('should return false for lower role', () => {
    expect(hasHigherOrEqualRole(TenantRole.MEMBER, TenantRole.ADMIN))
      .toBe(false);
  });
});
```

#### Integration Tests
- Test API endpoints
- Check authentication
- Validate responses
- Test error handling

### 5. Documentation

#### Code Documentation
- JSDoc comments
- Type definitions
- Usage examples
- Edge cases

#### API Documentation
- Endpoint descriptions
- Request/response examples
- Error responses
- Authentication requirements

#### Architecture Documentation
- System overview
- Component interactions
- Data flow
- Security considerations

### 6. Pull Requests

#### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe testing done

## Screenshots
If applicable

## Checklist
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Code follows style guide
- [ ] All checks passing
```

#### Review Process
1. Submit PR
2. Pass automated checks
3. Code review
4. Address feedback
5. Final approval
6. Merge

### 7. Release Process

#### Version Numbers
Follow semantic versioning (MAJOR.MINOR.PATCH)

Example: 1.2.3
- MAJOR: Breaking changes
- MINOR: New features
- PATCH: Bug fixes

#### Release Steps
1. Update version
2. Update changelog
3. Create release branch
4. Deploy to staging
5. Run tests
6. Deploy to production
7. Tag release
8. Update documentation

## Getting Help

### Resources
- Project documentation
- Issue tracker
- Team chat
- Weekly meetings

### Contact
- GitHub issues
- Team chat
- Email maintainers

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.