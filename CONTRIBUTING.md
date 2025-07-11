# Contributing to EmailManagement

Thank you for considering contributing to EmailManagement! This document outlines the guidelines for contributing to this project.

## Code of Conduct

Please be respectful and considerate of others when contributing to this project.

## How to Contribute

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature-name`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some feature'`)
5. Push to the branch (`git push origin feature/your-feature-name`)
6. Open a Pull Request

## Pull Request Process

1. Ensure your code follows the existing style conventions
2. Update documentation (README.md, setup guides, etc.) with details of changes if appropriate
3. The PR should work across major browsers (Chrome, Firefox, Edge, Safari)
4. Ensure all tests pass and add new tests for new functionality
5. Verify that your changes don't break existing functionality
6. Include screenshots for UI changes

## Commit Message Guidelines

Please use clear and meaningful commit messages:

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests after the first line

Examples:
```
Fix sidebar collapse animation issue on mobile devices
Add Email template preview functionality
Update README with new features
```

## Development Setup

Please refer to the main README.md for development setup instructions.

## Coding Standards

### Frontend (React)
- Use consistent indentation (2 spaces)
- Write meaningful variable and function names
- Use functional components with hooks over class components
- Organize imports: React first, then external libraries, then local components/utils
- Keep components focused on single responsibilities
- Use proper TypeScript types where available
- Implement proper error handling in async operations

### Backend (Python/FastAPI)
- Follow PEP 8 style guidelines
- Use type hints for function parameters and return values
- Document functions with docstrings using Google style
- Handle exceptions explicitly with appropriate status codes
- Log errors and significant events for debugging
- Keep functions focused on single responsibilities

## Testing Guidelines

### Frontend Testing
- Write unit tests for utility functions using Jest
- Use React Testing Library for component tests
- Test key user flows and interactions

### Backend Testing
- Write unit tests for services and utilities using pytest
- Test API endpoints with FastAPI TestClient
- Mock external dependencies (database, email services, etc.)

## Branch Naming Convention

Use the following naming convention for branches:
- `feature/short-description` - For new features
- `bugfix/issue-description` - For bug fixes
- `docs/update-description` - For documentation changes
- `refactor/component-name` - For code refactoring

Thank you for contributing to EmailManagement!
