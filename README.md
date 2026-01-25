# [mskills](https://github.com/yurakawa/mskills)

**mskills** is a CLI tool to manage "Agent Skills" for various AI agents (Claude, Codex, Gemini, Copilot, Antigravity) in a centralized way.

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

### 1. Add/Install a Skill

Install a skill from a GitHub URL or add a local skill.

```bash
mskills add <source> [name]
```

**Add from GitHub URL:**
```bash
# Install from a specific subdirectory in a repository
mskills add https://github.com/user/repo/tree/main/path/to/skill

# Example: Install 'skill-creator' from anthropics/skills
mskills add https://github.com/anthropics/skills/tree/main/skills/skill-creator
```

> [!NOTE]
> When installing from a specific subdirectory, **mskills** uses `git sparse-checkout` to download only the necessary files, ensuring efficiency even for large repositories.

**Add from Local Path:**
```bash
# Registers a skill from a local directory
mskills add ./examples/hello-world
# Legacy format also supported: mskills add <name> <path>
# mskills add hello-world ./examples/hello-world
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

### 4. Generate XML Prompt for AI Agents

Generate an XML block of available skills to be injected into an AI agent's system prompt.

```bash
mskills prompt
```

This will output an XML block like:
```xml
<available_skills>
  <skill>
    <name>hello-world</name>
    <description>A simple hello world skill</description>
    <location>/Users/yurakawa/.mskills/skills/hello-world/SKILL.md</location>
  </skill>
</available_skills>
```

### Commands

| Command | Description |
| :--- | :--- |
| `mskills add <source> [name]` | Add/Install a skill from GitHub or local path. |
| `mskills update <name> [source]` | Update an installed skill. |
| `mskills remove <names...>` | Remove registered skills. |
| `mskills list` | List registered skills. |
| `mskills agents add <names...>` | Enable target agents. |
| `mskills agents remove <names...>` | Disable target agents. |
| `mskills agents list` | List enabled agents. |
| `mskills apply` | Apply skills to enabled agents. |
| `mskills apply --force` | Force overwrite existing skills. |
| `mskills prompt` | Generate XML prompt for AI agents. |

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
| **Antigravity** | `antigravity` | `~/.gemini/antigravity/skills` |

## Demo

A demo skill is included in `examples/hello-world`.

```bash
# 1. Add the demo skill
mskills install ./examples/hello-world

# 2. Enable an agent (e.g., Claude)
mskills agents add claude

# 3. Apply
mskills apply

# 4. Check result
ls -l ~/.claude/skills/hello-world
```
