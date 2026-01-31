import { describe, it, expect, vi, beforeEach } from 'vitest';
import { installFromGit, parseGitHubUrl } from './git.js';

import fs from 'node:fs/promises';

vi.mock('node:child_process', () => ({
  exec: vi.fn((cmd, ...args) => {
      const cb = args.find(arg => typeof arg === 'function');
      if (cb) {
        cb(null, { stdout: '', stderr: '' });
      }
      return { stdout: null, stderr: null };
  })
}));
vi.mock('node:fs/promises');
vi.mock('os', () => ({
    default: {
        tmpdir: () => '/tmp'
    }
}));

import { exec } from 'node:child_process';
const execMock = vi.mocked(exec);

describe('git utils', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(fs.mkdtemp).mockResolvedValue('/tmp/mskills-git-123');
        vi.mocked(fs.access).mockResolvedValue(undefined);
        vi.mocked(fs.cp).mockResolvedValue(undefined);
        vi.mocked(fs.rm).mockResolvedValue(undefined);
    });

    describe('parseGitHubUrl', () => {
        it('should parse full subdirectory URL', () => {
            const result = parseGitHubUrl('https://github.com/owner/repo/tree/main/path/to/skill');
            expect(result).toEqual({
                url: 'https://github.com/owner/repo.git',
                branch: 'main',
                path: 'path/to/skill'
            });
        });

        it('should handle trailing slash in subdirectory URL', () => {
            const result = parseGitHubUrl('https://github.com/owner/repo/tree/main/path/to/skill/');
            expect(result).toEqual({
                url: 'https://github.com/owner/repo.git',
                branch: 'main',
                path: 'path/to/skill'
            });
        });

        it('should handle blob URL', () => {
            const result = parseGitHubUrl('https://github.com/owner/repo/blob/main/path/to/skill/SKILL.md');
            expect(result).toEqual({
                url: 'https://github.com/owner/repo.git',
                branch: 'main',
                path: 'path/to/skill/SKILL.md'
            });
        });

        it('should handle whitespace in URL', () => {
            const result = parseGitHubUrl('  https://github.com/owner/repo/tree/main/skill  ');
            expect(result).toEqual({
                url: 'https://github.com/owner/repo.git',
                branch: 'main',
                path: 'skill'
            });
        });

        it('should return null for non-matching URL', () => {
             expect(parseGitHubUrl('https://example.com/foo')).toBeNull();
        });
    });

    describe('installFromGit', () => {
        it('should use sparse checkout for subdirectory', async () => {
            const url = 'https://github.com/owner/repo/tree/main/skill';
            await installFromGit(url, '/dest/path');

            // Verify sparse checkout sequence
            expect(execMock).toHaveBeenCalledWith('git init', expect.anything(), expect.anything());
            expect(execMock).toHaveBeenCalledWith(expect.stringContaining('git remote add origin'), expect.anything(), expect.anything());
            expect(execMock).toHaveBeenCalledWith(expect.stringContaining('git config'), expect.anything(), expect.anything());
            expect(execMock).toHaveBeenCalledWith(expect.stringContaining('git sparse-checkout set'), expect.anything(), expect.anything());
            expect(execMock).toHaveBeenCalledWith(expect.stringContaining('git pull origin main'), expect.anything(), expect.anything());
        });

        it('should throw error for root url', async () => {
             const url = 'https://github.com/owner/repo.git';
             await expect(installFromGit(url, '/dest/path')).rejects.toThrow('Installing from repository root is not supported');
        });
    });
});
