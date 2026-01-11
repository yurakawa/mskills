---
applies_to:
  - "**/*.ts"
  - "**/*.tsx"
---

# TypeScript Instructions

## Module System

- **ESM Only**: This project uses ES modules exclusively
- **Import Extensions**: Always use `.js` extensions when importing local modules, even for `.ts` files
  - ✅ `import { config } from './config/index.js'`
  - ❌ `import { config } from './config/index'`
  - ❌ `import { config } from './config/index.ts'`

## Type Safety

- **Strict Mode**: TypeScript strict mode is enabled - maintain type safety
- **No Implicit Any**: Avoid implicit `any` types
  - Use explicit types for function parameters and return values
  - Use `unknown` instead of `any` when type is uncertain, then narrow with type guards
- **Type Imports**: Use `import type` for type-only imports to avoid runtime overhead
  - ✅ `import type { Command } from 'commander'`

## Node.js APIs

- **Node Imports**: Use the `node:` protocol for built-in modules
  - ✅ `import fs from 'node:fs/promises'`
  - ✅ `import path from 'node:path'`
  - ✅ `import os from 'node:os'`
- **Async/Await**: Use promises and async/await for file system operations

## Error Handling

- **Type Errors**: When catching errors, type them as `any` or use type guards
  ```typescript
  try {
    // code
  } catch (error: any) {
    console.error(chalk.red(`Error: ${error.message}`));
  }
  ```

## Zod Schemas

- Use Zod for runtime validation of external data (config files, user input)
- Define TypeScript types from Zod schemas: `type Config = z.infer<typeof configSchema>`
- Provide sensible defaults with `.default()` for optional fields

## Testing

- Test files should be co-located with source files: `manager.test.ts` next to `manager.ts`
- Use Vitest's `vi.mock()` for mocking dependencies
- Import from compiled `.js` files when needed in tests
