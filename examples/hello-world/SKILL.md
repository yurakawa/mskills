---
name: hello-world
description: "Generates a friendly greeting message with optional customization for name, language, and format. Demonstrates proper Agent Skill structure with frontmatter, workflow steps, and examples. Use when the user asks for a greeting, hello world demo, or wants to test that mskills is working correctly."
license: MIT
---

# Hello World Skill

Generate a personalized greeting message. This skill serves as both a functional greeter and a reference example for building Agent Skills with mskills.

## When to Use

- User asks for a greeting or hello world message
- User wants to verify their mskills setup is working
- User needs a template to understand Agent Skill structure

## Workflow

1. **Parse request** — identify the target name (default: "World"), language preference, and desired format (plain text, markdown, or code block).
2. **Generate greeting** — produce the greeting string using the requested parameters.
3. **Present output** — display the greeting in the requested format.

## Examples

**Basic greeting:**
```
Input: "Say hello"
Output: Hello, World! 👋
```

**Custom name and format:**
```
Input: "Greet Alice in a code block"
Output:
  ```text
  Hello, Alice! Welcome to mskills.
  ```
```

**Verify mskills setup:**
```
Input: "Test that my skills are working"
Output: ✅ hello-world skill loaded successfully. Hello from mskills!
```

## Notes

- Keep greetings concise — one to two lines unless the user asks for more
- This skill's source is at `examples/hello-world/` in the mskills repository and can be used as a starting point for new skills
