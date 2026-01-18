import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateSkill, ValidationError } from './linter.js';
import fs from 'node:fs/promises';
import path from 'node:path';

vi.mock('node:fs/promises');

describe('validateSkill', () => {
  const mockSkillPath = '/abs/path/to/test-skill';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should pass for a valid skill', async () => {
    const validContent = `---
name: test-skill
description: A valid test skill.
license: MIT
---
# Body content`;

    vi.mocked(fs.access).mockResolvedValue(undefined);
    vi.mocked(fs.readFile).mockResolvedValue(validContent);

    const result = await validateSkill(mockSkillPath);
    expect(result.name).toBe('test-skill');
  });

  it('should throw if SKILL.md is missing', async () => {
    vi.mocked(fs.access).mockRejectedValue(new Error('ENOENT'));
    await expect(validateSkill(mockSkillPath)).rejects.toThrow(ValidationError);
    await expect(validateSkill(mockSkillPath)).rejects.toThrow('SKILL.md not found');
  });

  it('should throw if frontmatter is missing', async () => {
    const invalidContent = `# No frontmatter`;
    vi.mocked(fs.access).mockResolvedValue(undefined);
    vi.mocked(fs.readFile).mockResolvedValue(invalidContent);

    await expect(validateSkill(mockSkillPath)).rejects.toThrow('must start with YAML frontmatter');
  });

  it('should throw if name is missing in frontmatter', async () => {
    const noName = `---
description: Missing name.
---`;
    vi.mocked(fs.access).mockResolvedValue(undefined);
    vi.mocked(fs.readFile).mockResolvedValue(noName);

    await expect(validateSkill(mockSkillPath)).rejects.toThrow("must include a 'name' field");
  });

  it('should throw if name format is invalid', async () => {
    const invalidName = `---
name: INVALID_NAME
description: Invalid name format.
---`;
    vi.mocked(fs.access).mockResolvedValue(undefined);
    vi.mocked(fs.readFile).mockResolvedValue(invalidName);

    await expect(validateSkill(mockSkillPath)).rejects.toThrow("may only contain lowercase alphanumeric characters");
  });

  it('should throw if name does not match directory name', async () => {
    const mismatchedName = `---
name: different-name
description: Name mismatch.
---`;
    vi.mocked(fs.access).mockResolvedValue(undefined);
    vi.mocked(fs.readFile).mockResolvedValue(mismatchedName);

    await expect(validateSkill(mockSkillPath)).rejects.toThrow("does not match directory name");
  });

  it('should throw if description is missing', async () => {
    const noDesc = `---
name: test-skill
---`;
    vi.mocked(fs.access).mockResolvedValue(undefined);
    vi.mocked(fs.readFile).mockResolvedValue(noDesc);

    await expect(validateSkill(mockSkillPath)).rejects.toThrow("must include a 'description' field");
  });

  it('should throw if description is too long', async () => {
    const longDesc = 'a'.repeat(1025);
    const tooLongDesc = `---
name: test-skill
description: ${longDesc}
---`;
    vi.mocked(fs.access).mockResolvedValue(undefined);
    vi.mocked(fs.readFile).mockResolvedValue(tooLongDesc);

    await expect(validateSkill(mockSkillPath)).rejects.toThrow("'description' must be between 1 and 1024 characters");
  });
});
