# mskills - Copilot Instructions

## Project Overview

**mskills** is a CLI tool designed to manage "Agent Skills" for various AI agents (Claude, Codex, Gemini, Copilot, Cursor) in a centralized way. It allows users to register skills, enable agents, and apply skills across different agent configurations through symbolic links or file copies.

## Tech Stack

- **Language**: TypeScript (strict mode enabled)
- **Runtime**: Node.js (ES2022, ESM modules with `.js` extension imports)
- **Package Manager**: npm
- **Testing**: Vitest
- **CLI Framework**: Commander.js
- **UI/Styling**: chalk (terminal colors), ora (spinners)
- **Validation**: Zod for runtime type checking

## Architecture

### Directory Structure

- `src/` - Source code in TypeScript
  - `agents/` - Agent definitions and management (base.ts, manager.ts)
  - `commands/` - CLI command implementations (add, remove, list, apply, agents)
  - `config/` - Configuration file management (~/.mskills.json)
  - `skills/` - Skill management logic
  - `index.ts` - Main CLI entry point
- `dist/` - Compiled JavaScript output (not committed)
- `demo-skill/` - Example skill for demonstrations

### Key Concepts

1. **Skills**: Directories containing agent instructions, registered with a name and path
2. **Agents**: Supported AI agents with their configuration directories (~/.claude/skills, ~/.copilot/skills, etc.)
3. **Config**: JSON file stored at `~/.mskills.json` containing registered skills and enabled agents
4. **Apply**: Creates symbolic links (or copies) from skill directories to agent skill directories

## Coding Standards

### TypeScript Guidelines

1. **Use strict mode** - Already enabled in tsconfig.json
2. **Avoid `any` type** - Use proper typing or `unknown` with type guards
3. **ESM imports** - Always use `.js` extensions for local module imports (e.g., `'./config/index.js'`)
4. **Use modern Node.js APIs** - Prefer `node:fs/promises`, `node:path`, `node:os` imports
5. **Commander types** - Import types with `import type { Command } from 'commander'`
6. **Error handling** - Catch errors and display user-friendly messages with chalk.red()

### Code Style

1. **Consistent formatting** - Follow existing patterns in the codebase
2. **Descriptive names** - Use clear variable and function names
3. **Chalk for output**:
   - `chalk.green()` for success messages with ✓ symbol
   - `chalk.red()` for error messages
   - `chalk.cyan()` for info messages
4. **Ora spinners** - Use for long-running operations (applying skills)
5. **Exit codes** - Use `process.exit(1)` for error conditions

### Testing

1. **Test framework**: Vitest
2. **Test files**: Co-located with source files (e.g., `manager.test.ts`)
3. **Mock external dependencies**: Use `vi.mock()` for file system, ora, chalk
4. **Test structure**: describe/it blocks with clear test names
5. **Run tests**: `npm test`

## Build & Development

### Commands

- `npm install` - Install dependencies
- `npm run build` - Compile TypeScript to JavaScript (outputs to `dist/`)
- `npm run dev` - Run directly with ts-node
- `npm test` - Run test suite with Vitest
- `npm link` - Link CLI globally for local testing

### Build Process

- TypeScript compiles from `src/` to `dist/`
- Module resolution: NodeNext (ESM)
- Target: ES2022
- The `prepare` script automatically runs build on npm install

## Supported Agents

Currently supported agents with their skill directories:

- **claude**: `~/.claude/skills`
- **cursor**: `~/.cursor/skills`
- **codex**: `~/.codex/skills`
- **gemini**: `~/.gemini/skills`
- **github-copilot-cli**: `~/.copilot/skills`

When adding new agents, update `src/agents/base.ts` with the agent name and skills directory path.

## Configuration

- Config file: `~/.mskills.json`
- Schema validated with Zod
- Structure:
  ```json
  {
    "skills": {
      "skill-name": {
        "path": "/absolute/path/to/skill"
      }
    },
    "agents": ["claude", "github-copilot-cli"]
  }
  ```

## Common Patterns

### Command Registration

```typescript
export function registerCommandName(program: Command) {
  program
    .command('command-name')
    .description('Description')
    .action(async () => {
      try {
        // Implementation
        console.log(chalk.green('✓ Success message'));
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });
}
```

### Error Handling

Always wrap async operations in try-catch and provide user-friendly error messages. Exit with code 1 on errors.

## Important Notes

1. **Module Extensions**: Always use `.js` extensions in imports even though source files are `.ts`
2. **No `any` types**: Prefer proper typing or `unknown` with type narrowing
3. **Consistent Success/Error Messages**: Use chalk colors and symbols (✓, ✗)
4. **File System Operations**: Use `node:fs/promises` for async file operations
5. **Testing**: Mock external dependencies (fs, ora, chalk) in tests

## Future Enhancements

When working on new features, consider:
- Maintaining backward compatibility with existing config files
- Adding tests for new functionality
- Updating the README.md with usage examples
- Following the established CLI command patterns
- Validating inputs with Zod schemas where appropriate
