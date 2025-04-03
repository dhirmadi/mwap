# Contributing to MWAP

## Issue Management

### Issue Organization
- Issues are organized into milestones representing major development phases
- Each issue is labeled with relevant categories (e.g., `testing`, `backend`, `security`)
- Issues contain detailed descriptions, tasks, and acceptance criteria

### Working on Issues
1. **Branch Naming**
   - Use descriptive branch names based on the issue type and number
   - Format: `type/issue-number-description`
   - Example: `test/14-rate-limit-tests`

2. **Commit Messages**
   - Follow the conventional commit format
   - Include issue number in commit messages
   - Example: `test(rate-limit): add window tests #14`

3. **Pull Requests**
   - Link PRs to issues using `Fixes #issue-number`
   - Include comprehensive descriptions
   - List implemented test cases and utilities
   - Update documentation as needed

### Issue Types and Labels
- `testing`: Testing-related tasks and improvements
- `backend`: Backend development tasks
- `frontend`: Frontend development tasks
- `ci-cd`: CI/CD pipeline tasks
- `security`: Security-related tasks
- `documentation`: Documentation tasks

### Milestones
1. **API Integration Testing Phase**
   - Rate limiting test cases
   - Security middleware tests
   - Auth0 test coverage

2. **Frontend Testing Phase**
   - React Testing Library setup
   - Component test implementation
   - Hook testing

3. **CI/CD Integration Phase**
   - GitHub Actions setup
   - Test automation
   - Coverage reporting

## Development Guidelines

### Testing
1. **Test Coverage**
   - Maintain >80% code coverage
   - Write comprehensive test cases
   - Follow test-driven development when possible

2. **Test Organization**
   - Group related test cases
   - Use descriptive test names
   - Document test utilities

3. **Test Quality**
   - Test edge cases
   - Include error scenarios
   - Verify timing-sensitive operations

### Code Quality
1. **Code Style**
   - Follow TypeScript best practices
   - Use consistent formatting
   - Write self-documenting code

2. **Documentation**
   - Document complex logic
   - Update README files
   - Include usage examples

3. **Security**
   - Follow security best practices
   - Document security considerations
   - Test security features thoroughly

## Getting Started

1. **Setup Development Environment**
   ```bash
   # Clone repository
   git clone https://github.com/dhirmadi/mwap.git
   cd mwap

   # Install dependencies
   npm install
   cd client && npm install
   cd ../server && npm install
   ```

2. **Run Tests**
   ```bash
   # Run all tests
   npm test

   # Run specific test suites
   npm test -- --testMatch "**/__tests__/integration/**/*.test.ts"
   ```

3. **Create Pull Request**
   ```bash
   # Create feature branch
   git checkout -b test/14-rate-limit-tests

   # Make changes and commit
   git add .
   git commit -m "test(rate-limit): add basic test cases #14"

   # Push changes
   git push origin test/14-rate-limit-tests
   ```

## Additional Resources

- [Project Status](../status_project.md)
- [Security Policy](../SECURITY.md)
- [API Documentation](./API.md)
- [Testing Patterns](./testing-patterns.md)
