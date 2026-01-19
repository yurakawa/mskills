import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Command } from 'commander';
import { registerPromptCommand } from './prompt.js';
import { skillManager } from '../skills/manager.js';

vi.mock('../skills/manager.js', () => ({
  skillManager: {
    getSkillsWithMetadata: vi.fn(),
  },
}));

describe('prompt command', () => {
  let program: Command;

  beforeEach(() => {
    vi.clearAllMocks();
    program = new Command();
    registerPromptCommand(program);
  });

  it('should output XML for available skills', async () => {
    vi.mocked(skillManager.getSkillsWithMetadata).mockResolvedValue([
      {
        name: 'test-skill',
        description: 'A test skill',
        path: '/abs/path/to/test-skill',
      },
    ]);

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await program.parseAsync(['node', 'test', 'prompt']);

    expect(logSpy).toHaveBeenCalledWith('<available_skills>');
    expect(logSpy).toHaveBeenCalledWith('  <skill>');
    expect(logSpy).toHaveBeenCalledWith('    <name>test-skill</name>');
    expect(logSpy).toHaveBeenCalledWith('    <description>A test skill</description>');
    expect(logSpy).toHaveBeenCalledWith('    <location>/abs/path/to/test-skill/SKILL.md</location>');
    expect(logSpy).toHaveBeenCalledWith('  </skill>');
    expect(logSpy).toHaveBeenCalledWith('</available_skills>');

    logSpy.mockRestore();
  });

  it('should output empty XML block if no skills are found', async () => {
    vi.mocked(skillManager.getSkillsWithMetadata).mockResolvedValue([]);

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await program.parseAsync(['node', 'test', 'prompt']);

    expect(logSpy).toHaveBeenCalledWith('<available_skills>\n</available_skills>');

    logSpy.mockRestore();
  });
});
