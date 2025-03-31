# Security Policy

## Supported Versions

Use this section to tell people about which versions of your project are currently being supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of MWAP seriously. If you believe you have found a security vulnerability, please report it to us as described below.

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to security@mwap.com (replace with actual security contact).

You should receive a response within 48 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

Please include the requested information listed below (as much as you can provide) to help us better understand the nature and scope of the possible issue:

* Type of issue (e.g. buffer overflow, SQL injection, cross-site scripting, etc.)
* Full paths of source file(s) related to the manifestation of the issue
* The location of the affected source code (tag/branch/commit or direct URL)
* Any special configuration required to reproduce the issue
* Step-by-step instructions to reproduce the issue
* Proof-of-concept or exploit code (if possible)
* Impact of the issue, including how an attacker might exploit it

This information will help us triage your report more quickly.

## Security Measures

### Authentication & Authorization
- Auth0 integration for secure user authentication
- JWT token validation for API requests
- Role-based access control
- Session management with secure token storage

### Data Protection
- MongoDB connection uses encrypted credentials
- Sensitive data stored in environment variables
- Data encryption at rest and in transit
- Regular security audits and updates

### API Security
- CORS configuration
- Rate limiting
- Input validation and sanitization
- Error handling that doesn't expose sensitive information

### Infrastructure Security
- Heroku's secure platform features
- Regular dependency updates
- Security headers configuration
- SSL/TLS encryption

### Development Practices
- Code review requirements
- Security-focused testing
- Dependency vulnerability scanning
- Secure deployment pipeline

## Preferred Languages

We prefer all communications to be in English.

## Policy

### Disclosure Policy

When we receive a security bug report, we will:

1. Confirm the problem and determine the affected versions.
2. Audit code to find any potential similar problems.
3. Prepare fixes for all releases still under maintenance.
4. Release new versions and/or patches.

### Comments on this Policy

If you have suggestions on how this process could be improved please submit a pull request.