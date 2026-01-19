# [mskills](https://github.com/yurakawa/mskills)

**mskills** is a CLI tool to manage "Agent Skills" for various AI agents (Claude, Codex, Gemini, Copilot) in a centralized way.

## Installation

### From npm (Recommended)

```bash
npm install -g mskills
```

### From Source

```bash
git clone https://github.com/yurakawa/mskills.git
cd mskills
npm install
npm run build
npm link
```

## Usage

### 1. Add a Skill

Register a skill directory to mskills. **mskills** validates the skill directory based on the [Agent Skills specification](https://agentskills.io/specification).

#### Valid Skill Requirements:
- A `SKILL.md` file must exist in the root of the skill directory.
- `SKILL.md` must start with YAML frontmatter containing `name` and `description`.
- The `name` in `SKILL.md` must match the parent directory name.
- For more details, see the [official specification](https://agentskills.io/specification).

```bash
mskills add <skill-name> <path/to/skill>
```

**Example:**

```bash
mskills add hello-world ./examples/hello-world
```

### 2. Enable Agents

Select which agents you want to apply the skills to.

```bash
mskills agents add <agent-names...>
```

> [!TIP]
> See [Supported Agents](#supported-agents) for the list of available agent names (e.g., `claude`, `cursor`, `github-copilot-cli`).

**Example:**

```bash
# Enable for Claude and GitHub Copilot
mskills agents add claude github-copilot-cli
```

### 3. Apply Skills

Sync your configured skills to the enabled agents' configuration directories.

```bash
mskills apply
```

This will create symbolic links (default) or copies of your skills in the agent's skills directory (e.g., `~/.claude/skills/hello-world`).

### Commands

| Command | Description |
| :--- | :--- |
| `mskills add <name> <path>` | Register a skill. |
| `mskills remove <names...>` | Remove registered skills. |
| `mskills list` | List registered skills. |
| `mskills agents add <names...>` | Enable target agents. |
| `mskills agents remove <names...>` | Disable target agents. |
| `mskills agents list` | List enabled agents. |
| `mskills apply` | Apply skills to enabled agents. |
| `mskills apply --force` | Force overwrite existing skills. |

## Configuration

**mskills** stores its configuration and data in the following directory:

- **Config File**: `~/.mskills/config.json`
- **Internal Skills Cache**: `~/.mskills/skills` (used for internal management)

## Supported Agents

| Agent | CLI Name | Skills Directory |
| :--- | :--- | :--- |
| **Claude** | `claude` | `~/.claude/skills` |
| **Cursor** | `cursor` | `~/.cursor/skills` |
| **Codex** | `codex` | `~/.codex/skills` |
| **Gemini** | `gemini` | `~/.gemini/skills` |
| **GitHub Copilot CLI** | `github-copilot-cli` | `~/.copilot/skills` |

## Demo

A demo skill is included in `examples/hello-world`.

```bash
# 1. Add the demo skill
mskills add hello-world ./examples/hello-world

# 2. Enable an agent (e.g., Claude)
mskills agents add claude

# 3. Apply
mskills apply

# 4. Check result
ls -l ~/.claude/skills/hello-world
```
