# Testing Setup Guide

This project includes comprehensive unit and end-to-end (e2e) tests for the client application.

## Test Structure

```
client/
├── __tests__/                 # Unit tests
│   ├── components/           # Component tests
│   │   ├── login.test.tsx
│   │   └── loyalty-dashboard.test.tsx
│   ├── hooks/               # Custom hook tests
│   │   ├── use-loyalty-data.test.ts
│   │   ├── use-payment.test.ts
│   │   └── use-cashback.test.ts
│   ├── lib/                 # Utility function tests
│   │   ├── utils.test.ts
│   │   ├── validation.test.ts
│   │   └── api-client.test.ts
│   └── store/               # Redux store tests
│       ├── index.test.ts
│       └── entityFactory.test.ts
├── e2e/                     # End-to-end tests
│   ├── auth.spec.ts
│   ├── dashboard.spec.ts
│   └── admin.spec.ts
├── jest.config.js           # Jest configuration
├── jest.setup.js           # Jest setup file
└── playwright.config.ts    # Playwright configuration
```

## Running Tests

### Unit Tests (Jest)

```bash
# Run all unit tests
pnpm run test

# Run tests in watch mode
pnpm run test:watch

# Run tests with coverage
pnpm run test:coverage

# Run tests for CI
pnpm run test:ci
```

### End-to-End Tests (Playwright)

```bash
# Run all e2e tests
pnpm run test:e2e

# Run e2e tests with UI
pnpm run test:e2e:ui

# Run e2e tests in headed mode (visible browser)
pnpm run test:e2e:headed

# Debug e2e tests
pnpm run test:e2e:debug
```

### Run All Tests

```bash
# Run both unit and e2e tests
pnpm run test:all
```

## Test Coverage

The unit tests aim for 70% coverage across:
- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

## Test Categories

### Unit Tests

1. **Component Tests**
   - Login component functionality
   - LoyaltyDashboard component behavior
   - Form validation and user interactions
   - Loading states and error handling

2. **Hook Tests**
   - useLoyaltyData hook behavior
   - usePayment hook functionality
   - useCashback hook operations
   - State management and side effects

3. **Utility Tests**
   - Class name merging (cn function)
   - Error handling utilities
   - Form validation functions
   - API client functionality

4. **Store Tests**
   - Redux store configuration
   - Entity factory functionality
   - API endpoint generation
   - URL parameter handling

### End-to-End Tests

1. **Authentication Flow**
   - Login form validation
   - Successful authentication
   - Role-based redirects
   - Error handling
   - Password visibility toggle

2. **Loyalty Dashboard**
   - Data loading and display
   - Tab navigation
   - Achievement simulation
   - Payment modal interaction
   - Responsive design

3. **Admin Panel**
   - Admin access control
   - Tab navigation
   - Logout functionality
   - Role-based access
   - Responsive design

## Test Configuration

### Jest Configuration
- Uses Next.js Jest configuration
- Includes React Testing Library
- Mocks Next.js router and authentication
- Configures module path mapping
- Sets up coverage thresholds

### Playwright Configuration
- Tests multiple browsers (Chrome, Firefox, Safari)
- Includes mobile viewport testing
- Configures base URL and timeouts
- Sets up test retry logic
- Includes trace collection for debugging

## Mocking Strategy

### Unit Tests
- Next.js router and navigation
- NextAuth session management
- Axios HTTP client
- Browser APIs (localStorage, matchMedia, etc.)
- Timer functions for async operations

### E2E Tests
- Authentication state
- API responses
- Network conditions
- Browser environments

## Best Practices

1. **Test Isolation**: Each test is independent and doesn't rely on others
2. **Descriptive Names**: Test names clearly describe what is being tested
3. **Arrange-Act-Assert**: Tests follow the AAA pattern
4. **Mock External Dependencies**: External services and APIs are mocked
5. **Cover Edge Cases**: Tests include error conditions and edge cases
6. **Accessibility Testing**: E2E tests verify keyboard navigation and screen reader compatibility
7. **Responsive Testing**: Tests verify functionality across different screen sizes

## Debugging Tests

### Unit Tests
```bash
# Run specific test file
pnpm test -- login.test.tsx

# Run tests matching pattern
pnpm test -- --testNamePattern="Login"

# Debug with Node.js inspector
node --inspect-brk node_modules/.bin/jest --runInBand
```

### E2E Tests
```bash
# Run specific test file
npx playwright test auth.spec.ts

# Run tests in debug mode
npx playwright test --debug

# Run tests with UI mode
npx playwright test --ui
```

## Continuous Integration

The test suite is designed to run in CI environments:
- Unit tests run with `pnpm run test:ci`
- E2E tests run with `pnpm run test:e2e`
- Coverage reports are generated
- Tests run in headless mode for CI

## Adding New Tests

### Unit Tests
1. Create test file in appropriate `__tests__` directory
2. Follow naming convention: `*.test.ts` or `*.test.tsx`
3. Import necessary testing utilities
4. Mock external dependencies
5. Write descriptive test cases

### E2E Tests
1. Create test file in `e2e/` directory
2. Follow naming convention: `*.spec.ts`
3. Use Playwright test utilities
4. Mock authentication and API responses
5. Test user workflows end-to-end

## Troubleshooting

### Common Issues

1. **Tests timing out**: Increase timeout values in test configuration
2. **Mock not working**: Ensure mocks are set up before imports
3. **E2E tests failing**: Check if dev server is running
4. **Coverage not accurate**: Verify file patterns in jest.config.js

### Getting Help

- Check Jest documentation for unit testing
- Check Playwright documentation for e2e testing
- Review existing test files for patterns
- Use test debugging tools for troubleshooting
