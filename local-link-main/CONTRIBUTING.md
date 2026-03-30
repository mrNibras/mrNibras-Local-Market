# Contributing to Local Link API

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Issue Reporting](#issue-reporting)

---

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Welcome newcomers and help them learn

---

## Getting Started

### 1. Fork and Clone

```bash
# Fork on GitHub, then:
git clone https://github.com/your-username/local-link-api.git
cd local-link-api
```

### 2. Install Dependencies

```bash
cd server
npm install
```

### 3. Setup Environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 4. Run Tests

```bash
npm test
```

---

## Development Workflow

### 1. Create a Branch

```bash
# Main branch
git checkout main

# Create feature branch
git checkout -b feature/your-feature-name
```

### 2. Make Changes

- Follow existing code structure
- Write tests for new features
- Update documentation

### 3. Commit Changes

```bash
git add .
git commit -m "feat: add your feature description"
```

**Commit Message Format:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test changes
- `chore:` - Build/config changes

### 4. Push and Create PR

```bash
git push origin feature/your-feature-name
# Then create Pull Request on GitHub
```

---

## Coding Standards

### JavaScript/Node.js

- Use ES6+ features
- Use async/await for async operations
- Follow existing patterns
- Keep functions small and focused
- Use meaningful variable names

### Example Structure

```javascript
// Use JSDoc comments
/**
 * Create a new booking
 * @param {Object} bookingData - Booking data
 * @param {string} customerId - Customer ID
 * @returns {Promise<Object>}
 */
export const createBooking = async (bookingData, customerId) => {
  // Implementation
};
```

### File Organization

```
modules/
├── module-name/
│   ├── module-name.model.js       # Database schema
│   ├── module-name.repository.js  # DB operations
│   ├── module-name.service.js     # Business logic
│   ├── module-name.controller.js  # HTTP handlers
│   └── module-name.routes.js      # API routes
```

---

## Testing

### Write Tests For:
- New features
- Bug fixes
- Edge cases
- Error handling

### Run Tests

```bash
# Unit tests
npm test

# Integration tests
node __tests__/runTests.js

# With coverage
npm run test:coverage
```

### Test Guidelines

```javascript
// Example test structure
describe('Module Name', () => {
  describe('Function Name', () => {
    it('should do something', async () => {
      // Arrange
      // Act
      // Assert
    });

    it('should handle error case', async () => {
      // Test error handling
    });
  });
});
```

---

## Documentation

### Update Documentation When:
- Adding new features
- Changing API endpoints
- Modifying behavior
- Fixing bugs

### Documentation Files

- `README.md` - Main project overview
- `server/README.md` - Backend documentation
- `server/API_DOCUMENTATION.md` - API reference
- `COMPLETE_FEATURE_LIST.md` - Feature documentation

### API Documentation Format

```markdown
### Endpoint Name
```http
METHOD /api/endpoint
Authorization: Bearer <token>
Content-Type: application/json

{
  "field": "value"
}
```

**Response:**
```json
{
  "success": true,
  "data": {}
}
```
```

---

## Pull Request Guidelines

### Before Submitting

- [ ] Tests pass (`npm test`)
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] No unused variables
- [ ] Commit messages are clear

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests added/updated
- [ ] All tests pass
- [ ] Tested manually

## Checklist
- [ ] Code follows guidelines
- [ ] Documentation updated
- [ ] No breaking changes
- [ ] Ready for review
```

---

## Issue Reporting

### Bug Reports

Include:
- Clear title
- Description of the issue
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment (Node version, OS)
- Screenshots/logs if applicable

### Feature Requests

Include:
- Clear title
- Problem statement
- Proposed solution
- Use cases
- Alternatives considered

---

## Architecture Overview

```
Client → Controller → Service → Repository → Model
```

### Layer Responsibilities

- **Controller**: Handle HTTP requests/responses
- **Service**: Business logic
- **Repository**: Database operations
- **Model**: Database schema

### Example Flow

```javascript
// Controller
export const createBooking = async (req, res) => {
  const booking = await bookingService.createBooking(req.body, req.user.id);
  res.status(201).json({ success: true, data: booking });
};

// Service
export const createBooking = async (bookingData, customerId) => {
  // Validate
  // Check availability
  // Create booking
  return await bookingRepository.create({ ...bookingData, customer: customerId });
};

// Repository
export const create = async (data) => {
  return await Booking.create(data);
};
```

---

## Security Guidelines

- Never commit `.env` files
- Never commit API keys or secrets
- Validate all user input
- Use parameterized queries
- Implement rate limiting
- Use HTTPS in production

---

## Questions?

- Check existing documentation
- Search existing issues
- Ask in discussions

---

## Thank You!

Your contributions make this project better for everyone. We appreciate your time and effort!

---

<div align="center">

**Made with ❤️ for Local Link**

</div>
