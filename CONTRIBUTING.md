# Contributing to MWAP

We love your input! We want to make contributing to MWAP as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Pull Request Process

1. Update the README.md with details of changes to the interface, if applicable.
2. Update the status_project.md with your changes.
3. The PR will be merged once you have the sign-off of two other developers.

## Any contributions you make will be under the MIT Software License

In short, when you submit code changes, your submissions are understood to be under the same [MIT License](http://choosealicense.com/licenses/mit/) that covers the project. Feel free to contact the maintainers if that's a concern.

## Report bugs using GitHub's [issue tracker](https://github.com/dhirmadi/mwap/issues)

We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/dhirmadi/mwap/issues/new).

## Write bug reports with detail, background, and sample code

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can.
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## Development Guidelines

### Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line

### JavaScript/TypeScript Style Guide

* Use TypeScript where possible
* 2 spaces for indentation
* Use `const` over `let` when possible
* Prefer arrow functions
* Use template literals over string concatenation
* Use async/await over raw promises

### React Guidelines

* Use functional components with hooks
* Keep components small and focused
* Use TypeScript for prop types
* Follow the container/presenter pattern
* Use CSS-in-JS with Mantine

### Testing Guidelines

* Write unit tests for all new features
* Use Jest and React Testing Library
* Test edge cases
* Mock external services
* Keep tests focused and atomic

## License

By contributing, you agree that your contributions will be licensed under its MIT License.