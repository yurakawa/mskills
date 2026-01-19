import fs from 'node:fs/promises';
import path from 'node:path';
import yaml from 'js-yaml';

export interface SkillMetadata {
  name: string;
  description: string;
  license?: string;
  compatibility?: string;
  metadata?: Record<string, string>;
  'allowed-tools'?: string;
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export async function validateSkill(skillPath: string) {
  const skillMdPath = path.join(skillPath, 'SKILL.md');
  
  try {
    await fs.access(skillMdPath);
  } catch {
    throw new ValidationError('SKILL.md not found in the skill directory.');
  }

  const content = await fs.readFile(skillMdPath, 'utf8');
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  
  if (!frontmatterMatch) {
    throw new ValidationError('SKILL.md must start with YAML frontmatter delimited by ---');
  }

  let metadata: SkillMetadata;
  try {
    metadata = yaml.load(frontmatterMatch[1]) as SkillMetadata;
  } catch (error) {
    throw new ValidationError(`Failed to parse YAML frontmatter: ${error instanceof Error ? error.message : String(error)}`);
  }

  if (!metadata) {
    throw new ValidationError('Frontmatter is empty or invalid.');
  }

  // Name validation
  if (!metadata.name) {
    throw new ValidationError("Frontmatter must include a 'name' field.");
  }
  
  if (typeof metadata.name !== 'string') {
    throw new ValidationError("'name' field must be a string.");
  }

  // simplified here to a-z0-9 and hyphens which is common for slug-like names.
  // The spec also says 1-64 characters.
  if (metadata.name.length < 1 || metadata.name.length > 64) {
    throw new ValidationError("'name' must be between 1 and 64 characters.");
  }

  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(metadata.name)) {
    throw new ValidationError("'name' may only contain lowercase alphanumeric characters and hyphens, and cannot start/end with a hyphen or contain consecutive hyphens.");
  }

  // Description validation
  if (!metadata.description) {
    throw new ValidationError("Frontmatter must include a 'description' field.");
  }

  if (typeof metadata.description !== 'string') {
    throw new ValidationError("'description' field must be a string.");
  }

  if (metadata.description.length < 1 || metadata.description.length > 1024) {
    throw new ValidationError("'description' must be between 1 and 1024 characters.");
  }

  // Parent directory name check (recommended by spec)
  const parentDirName = path.basename(skillPath);
  if (metadata.name !== parentDirName) {
    // We'll treat this as a warning or a requirement based on the user's "properly lint" request.
    // The spec says "Must match the parent directory name".
    throw new ValidationError(`Skill name '${metadata.name}' in SKILL.md does not match directory name '${parentDirName}'.`);
  }

  return metadata;
}
