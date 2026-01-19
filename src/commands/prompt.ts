import type { Command } from 'commander';
import path from 'node:path';
import { skillManager } from '../skills/manager.js';

export function registerPromptCommand(program: Command) {
  program
    .command('prompt')
    .description('Generate XML prompt for AI agents')
    .action(async () => {
      const skills = await skillManager.getSkillsWithMetadata();

      if (skills.length === 0) {
        // Output empty block if no skills
        console.log('<available_skills>\n</available_skills>');
        return;
      }

      console.log('<available_skills>');
      for (const skill of skills) {
        const skillPath = path.join(skill.path, 'SKILL.md');
        console.log('  <skill>');
        console.log(`    <name>${skill.name}</name>`);
        console.log(`    <description>${skill.description}</description>`);
        console.log(`    <location>${skillPath}</location>`);
        console.log('  </skill>');
      }
      console.log('</available_skills>');
    });
}
