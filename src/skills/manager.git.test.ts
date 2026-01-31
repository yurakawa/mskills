import { describe, it, expect, vi, beforeEach } from 'vitest';
import { skillManager } from './manager.js';
import fs from 'node:fs/promises';
import { loadConfig, saveConfig } from '../config/index.js';
import { pullRepo, isGitUrl, installFromGit } from '../utils/git.js';

vi.mock('node:fs/promises');
vi.mock('../config/index.js');
vi.mock('../utils/git.js');

describe('SkillManager with Git', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(loadConfig).mockResolvedValue({ skills: {}, agents: [] });
    vi.mocked(fs.access).mockResolvedValue(undefined);
    vi.mocked(fs.mkdir).mockResolvedValue(undefined);
    vi.mocked(fs.cp).mockResolvedValue(undefined);
    vi.mocked(fs.rm).mockResolvedValue(undefined);
    // Mock reading SKILL.md for validation
    vi.mocked(fs.readFile).mockResolvedValue('---\nname: test-skill\ndescription: test\n---\n');

    // Mock Git utils
    vi.mocked(installFromGit).mockResolvedValue(undefined);
    vi.mocked(pullRepo).mockResolvedValue(undefined);
    vi.mocked(isGitUrl).mockImplementation((url) => url.startsWith('http') || url.startsWith('git') || url.includes('github.com'));
  });

  describe('add', () => {
    it('should install from git when source is subdirectory URL', async () => {
      const url = 'https://github.com/user/repo/tree/main/test-skill';
      await skillManager.add(url);

      expect(isGitUrl).toHaveBeenCalledWith(url);
      expect(installFromGit).toHaveBeenCalledWith(url, expect.stringContaining('test-skill'));
      expect(saveConfig).toHaveBeenCalledWith(expect.objectContaining({
        skills: expect.objectContaining({
          'test-skill': expect.objectContaining({
            sourceUrl: url
          })
        })
      }));
    });

    it('should install from git when source is subdirectory URL with trailing slash', async () => {
      const url = 'https://github.com/user/repo/tree/main/test-skill/';
      await skillManager.add(url);

      expect(installFromGit).toHaveBeenCalledWith(url, expect.stringContaining('test-skill'));
    });

    it('should trim whitespace from source and name', async () => {
        const url = '  https://github.com/user/repo/tree/main/test-skill  ';
        await skillManager.add(url);

        expect(installFromGit).toHaveBeenCalledWith(url.trim(), expect.stringContaining('test-skill'));
        expect(saveConfig).toHaveBeenCalledWith(expect.objectContaining({
            skills: expect.objectContaining({
                'test-skill': expect.anything()
            })
        }));
    });
    it('should use provided name for git install', async () => {
        const url = 'https://github.com/user/repo'; // URL differs, but name provided
        const name = 'test-skill';
        await skillManager.add(url, name);
        
        expect(installFromGit).toHaveBeenCalledWith(url, expect.stringContaining(name));
         expect(saveConfig).toHaveBeenCalledWith(expect.objectContaining({
            skills: expect.objectContaining({
                [name]: expect.objectContaining({
                    sourceUrl: url
                })
            })
        }));
    });
  });

  describe('update', () => {
    it('should pull repo if source matches and has .git', async () => {
        const name = 'test-skill';
        const url = 'https://github.com/user/test-skill';
        vi.mocked(loadConfig).mockResolvedValue({
            skills: { [name]: { path: '/tmp/test-skill', sourceUrl: url } },
            agents: []
        });

        await skillManager.update(name, url);
        expect(pullRepo).toHaveBeenCalled();
        expect(installFromGit).not.toHaveBeenCalled();
    });

    it('should re-install if source differs', async () => {
        const name = 'test-skill';
        const oldUrl = 'https://github.com/user/old';
        const newUrl = 'https://github.com/user/new';
        vi.mocked(loadConfig).mockResolvedValue({
            skills: { [name]: { path: '/tmp/test-skill', sourceUrl: oldUrl } },
            agents: []
        });

        await skillManager.update(name, newUrl);
        expect(fs.rm).toHaveBeenCalled();
        expect(installFromGit).toHaveBeenCalledWith(newUrl, expect.any(String));
        expect(saveConfig).toHaveBeenCalled();
    });
    
     it('should pull if no source provided but sourceUrl exists and has .git', async () => {
        const name = 'test-skill';
        const url = 'https://github.com/user/test-skill';
        vi.mocked(loadConfig).mockResolvedValue({
            skills: { [name]: { path: '/tmp/test-skill', sourceUrl: url } },
            agents: []
        });

        await skillManager.update(name);
        expect(pullRepo).toHaveBeenCalled();
    });
    
    it('should re-install if sourceUrl exists but no .git (subdirectory install)', async () => {
        const name = 'test-skill';
        const url = 'https://github.com/user/repo/tree/main/test-skill';
        vi.mocked(loadConfig).mockResolvedValue({
            skills: { [name]: { path: '/tmp/test-skill', sourceUrl: url } },
            agents: []
        });
        // mock access failure for .git
        vi.mocked(fs.access).mockRejectedValueOnce(new Error('ENOENT'));

        await skillManager.update(name);
        expect(fs.rm).toHaveBeenCalled();
        expect(installFromGit).toHaveBeenCalledWith(url, expect.any(String));
    });
  });
});
