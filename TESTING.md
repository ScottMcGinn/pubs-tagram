# Testing Strategy - Pubs-tagram

## Overview

This project uses **Jest** with **TypeScript** support for unit testing. The testing philosophy prioritizes testing OUR code while **mocking all external dependencies**, particularly Firebase.

## Key Principles

1. **Mock Firebase Services** - Firebase auth, Firestore, and Storage are all mocked
2. **Unit Test Our Code** - Focus on testing business logic in contexts, screens, and utilities
3. **Fast & Isolated** - No real API calls, no network dependencies, tests run in milliseconds
4. **Don't Test Third-Party Code** - Firebase is maintained by Google, we trust it works

## Test Setup

### Configuration Files

- **jest.config.js** - Jest configuration with TypeScript support (ts-jest)
- **jest.setup.js** - Global test setup with Firebase, Expo, and React Navigation mocks
- **__mocks__/firebase.ts** - Firebase module mocks

### Mock Strategy

All Firebase modules are mocked at the module level:

```javascript
jest.mock('firebase/auth');
jest.mock('firebase/firestore');
jest.mock('firebase/storage');
```

This ensures:
- Tests never connect to actual Firebase
- Firebase methods return predictable mock values
- Tests run instantly without network I/O

## Test Structure

Test files should be co-located with source files or in a `__tests__` directory:

```
src/
  __tests__/
    AuthContext.test.ts       ← Test file
  contexts/
    AuthContext.tsx
  screens/
    FeedScreen.tsx
  utils/
    imageHelpers.ts
```

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (reruns on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Example: Testing Firebase Auth Mocking

See `src/__tests__/AuthContext.test.ts` for a working example that demonstrates:

1. **Mocking Firebase** - Mock `onAuthStateChanged` callback behavior
2. **Mock Implementation** - Provide custom implementations for different test scenarios
3. **Verification** - Check that mocks were called with expected arguments

```typescript
describe('Firebase Auth Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('can simulate user authentication flow', () => {
    const mockCallback = jest.fn();

    (auth.onAuthStateChanged as jest.Mock).mockImplementation(
      (authInstance, callback) => {
        setTimeout(() => {
          callback({ uid: 'test-123', email: 'test@example.com' });
        }, 0);
        return jest.fn();
      }
    );

    (auth.onAuthStateChanged as jest.Mock)({}, mockCallback);

    expect(auth.onAuthStateChanged).toHaveBeenCalled();
  });
});
```

## Writing New Tests

### Step 1: Create Test File

Create a `.test.ts` or `.spec.ts` file next to your source file:

```typescript
// src/__tests__/AuthContext.test.ts
import * as auth from 'firebase/auth';

jest.mock('firebase/auth');

describe('AuthContext', () => {
  // Tests go here
});
```

### Step 2: Mock External Dependencies

At the top of your test file, mock any Firebase or Expo modules:

```typescript
jest.mock('firebase/auth');
jest.mock('firebase/firestore');
jest.mock('expo-image-picker');
```

### Step 3: Write Test Cases

```typescript
it('does something when condition is met', () => {
  // Setup
  const mockFunction = jest.fn();
  
  // Execute
  myFunction();
  
  // Verify
  expect(mockFunction).toHaveBeenCalled();
});
```

## Common Testing Patterns

### Testing Firebase Auth Calls

```typescript
it('calls Firebase auth with correct parameters', () => {
  (auth.signInWithEmailAndPassword as jest.Mock).mockResolvedValue({
    user: { uid: 'test-123' }
  });

  // Your code that calls signInWithEmailAndPassword
  
  expect(auth.signInWithEmailAndPassword).toHaveBeenCalledWith(
    expect.any(Object),
    'test@example.com',
    'password123'
  );
});
```

### Testing Async Functions

```typescript
it('handles async operations', async () => {
  (someAsyncFunction as jest.Mock).mockResolvedValue({ data: 'result' });

  const result = await myAsyncFunction();

  expect(result).toEqual({ data: 'result' });
});
```

### Clearing Mocks Between Tests

```typescript
describe('MyTests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('test 1', () => {
    // Mocks are clean here
  });

  it('test 2', () => {
    // Mocks are clean here too
  });
});
```

## Coverage Goals

- **Statements**: 70%+
- **Branches**: 65%+
- **Functions**: 70%+
- **Lines**: 70%+

View coverage report: `npm run test:coverage`

## What NOT to Test

- ❌ Firebase functionality (it's tested by Google)
- ❌ React Navigation behavior (tested by React Navigation team)
- ❌ Expo module behavior (tested by Expo team)
- ❌ Third-party UI components (tested by their maintainers)

## What TO Test

- ✅ Custom business logic
- ✅ Mock Firebase interactions
- ✅ Data transformation and validation
- ✅ Error handling and edge cases
- ✅ Custom utility functions

## Debugging Tests

### Print Debug Info

```typescript
it('my test', () => {
  // Use console.log to debug
  console.log('Current state:', currentState);
});
```

Run with: `npm test -- --verbose`

### Check Mock Calls

```typescript
expect(mockFunction).toHaveBeenCalled();
expect(mockFunction).toHaveBeenCalledWith('expectedArg');
expect(mockFunction).toHaveBeenCalledTimes(2);
```

### Run Specific Test

```bash
npm test -- --testNamePattern="my test name"
```

### Watch Single File

```bash
npm run test:watch -- src/__tests__/AuthContext.test.ts
```

## Next Steps

1. Review [AuthContext.test.ts](src/__tests__/AuthContext.test.ts) for working example
2. Create tests for other Firebase-dependent code
3. Test custom utility functions
4. Aim for 70%+ coverage
5. Run `npm run test:coverage` to check progress
