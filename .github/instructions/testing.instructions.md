---
applies_to:
  - "**/*.test.ts"
  - "**/*.spec.ts"
---

# Testing Instructions

## Test Framework

This project uses **Vitest** for testing.

## Test File Location

- Co-locate test files with source files
- Naming: `filename.test.ts` (e.g., `manager.test.ts` for `manager.ts`)

## Test Structure

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Feature Name', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  it('should do something specific', async () => {
    // Arrange
    const input = 'test';

    // Act
    const result = await functionUnderTest(input);

    // Assert
    expect(result).toBe(expected);
  });
});
```

## Mocking

### File System Operations

```typescript
vi.mock('node:fs/promises', () => ({
  default: {
    readFile: vi.fn(),
    writeFile: vi.fn(),
    mkdir: vi.fn(),
    // ... other methods
  },
}));
```

### External Libraries

Mock chalk and ora to avoid terminal output during tests:

```typescript
vi.mock('chalk', () => ({
  default: {
    green: vi.fn((text) => text),
    red: vi.fn((text) => text),
    cyan: vi.fn((text) => text),
  },
}));

vi.mock('ora', () => ({
  default: vi.fn(() => ({
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn(),
    fail: vi.fn(),
  })),
}));
```

## Test Coverage

- Test both success and error paths
- Test edge cases (empty inputs, invalid data, etc.)
- Verify error messages and exit codes
- Mock external dependencies (file system, network, etc.)

## Running Tests

- Run all tests: `npm test`
- Tests run automatically on build via the prepare script
- Vitest runs in watch mode by default during development

## Assertions

- Use descriptive assertion messages
- Prefer specific assertions (`toBe`, `toEqual`, `toThrow`) over generic ones
- Test async functions with `await` and handle rejections appropriately
