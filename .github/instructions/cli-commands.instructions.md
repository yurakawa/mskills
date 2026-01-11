---
applies_to:
  - "src/commands/**/*.ts"
---

# CLI Command Instructions

## Command Structure

All commands follow a consistent pattern using Commander.js:

```typescript
import type { Command } from 'commander';
import chalk from 'chalk';

export function registerCommandName(program: Command) {
  program
    .command('command-name')
    .description('Brief description')
    .argument('[arg]', 'Argument description')
    .option('-f, --flag', 'Option description')
    .action(async (arg, options) => {
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

## User Feedback

- **Success**: Use `chalk.green()` with ✓ symbol
  ```typescript
  console.log(chalk.green(`✓ Skill '${name}' added`));
  ```

- **Errors**: Use `chalk.red()` with descriptive messages
  ```typescript
  console.error(chalk.red(`Error: ${error.message}`));
  process.exit(1);
  ```

- **Info**: Use `chalk.cyan()` for informational messages

- **Spinners**: Use `ora` for long-running operations
  ```typescript
  const spinner = ora('Processing...').start();
  // do work
  spinner.succeed('Done');
  ```

## Error Handling

- Always wrap command logic in try-catch blocks
- Exit with code 1 on errors: `process.exit(1)`
- Display user-friendly error messages, not stack traces

## Command Registration

- Export a `register*Command` function that takes a `Command` instance
- All command registrations are imported and called in `commands/index.ts`
- Use descriptive command names that match CLI usage

## Testing Commands

- Mock chalk, ora, and file system operations
- Test both success and error paths
- Verify correct exit codes on errors
