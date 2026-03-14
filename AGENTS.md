# AGENTS.md

This file contains guidelines and best practices for AI agents (like Claude, Copilot, Cursor, Antigravity, etc.) when working in this repository (`mskills`).

## 1. Project Overview
**mskills** is a CLI tool designed to centrally manage and apply "Agent Skills" for various AI agents.
It syncs and outputs skills from local sources or GitHub to each agent's dedicated directory (e.g., `~/.claude/skills` or `~/.gemini/antigravity/skills`).

## 2. Core Instructions for Agents
When interacting with the user or modifying source code, you must strictly follow these rules:

- **Handling Simple Tasks**: For simple questions or tasks that do not involve significant code changes or the implementation of new features, **do not generate** planning documents like `task.md`, `implementation_plan.md`, or `walkthrough.md` (unless explicitly permitted).
- **Documentation Storage**: If you need to generate documentation (like an implementation plan), always create a folder named `docs/[topic_name_in_snake_case]/` and save it there.

## 3. Technology Stack
- **Language & Module System**: TypeScript (ESM, targeting Node.js 18+, `type: "module"`)
- **CLI Framework**: Commander.js
- **Schema Validation**: Zod
- **Package Manager**: npm
- **Testing Framework**: Vitest
- **Release Management**: Changesets

## 4. Project Structure and Architecture
- `src/commands/`: Implementation layer for CLI commands (e.g., `add.ts`, `apply.ts`, `prompt.ts`, `export.ts`)
- `src/config/`: Configuration file (`~/.config/mskills/config.json`) reading, writing, and path resolution logic
- `src/skills/`: Parsing and downloading logic for skill sources (GitHub repositories, local paths)
- `src/agents/`: Coordination logic for applying skills to AI agents (using copies or symlinks)
- `src/utils/`: Common utility functions
- `.agent/workflows/` and `.agent/skills/`: Custom skills and workflow definitions for agents to execute autonomously

## 5. Development and Implementation Best Practices
- **Functional Approach**: To make the code predictable and testable, separate pure functions from side effects (like file system changes) as much as possible. (Example: use functions instead of constants for path resolution in `src/config`).
- **Error Handling**: Use `try-catch` appropriately. In case of anomalies, output clear and user-friendly messages (using tools like `chalk`).
- **Terminal UI**: Display a spinner using `ora` for time-consuming operations (like downloading from Git).
- **Test-Driven Development**: When adding or modifying logic, update or create corresponding tests in the same directory (`*.test.ts`) and run `npm run test` to ensure coverage and expected behavior. Use appropriate mocking or temporary directories for tests involving file I/O.
- **Cross-Platform Compatibility**: Use standard Node.js functions like `path.join` for path resolution to properly handle OS-dependent path separators.

## 6. Commands and Automated Execution
- **Build**: Always be mindful of building (`npm run build`) after modifying scripts, and check for any TypeScript type errors.
- **Lint**: Run `npm run lint` at logical stopping points and adhere to existing ESLint rules.
