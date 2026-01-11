import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { Command } from 'commander';
import { registerApplyCommand } from './apply.js';
import * as configModule from '../config/index.js';
import fs from 'node:fs/promises';
import type { Stats } from 'node:fs';
import ora from 'ora';

/**
 * Helper to create a partial mock of fs.Stats
 */
function createMockStats(overrides: Partial<Stats> = {}): Stats {
  return {
    isSymbolicLink: () => false,
    isDirectory: () => false,
    isFile: () => false,
    isBlockDevice: () => false,
    isCharacterDevice: () => false,
    isFIFO: () => false,
    isSocket: () => false,
    dev: 0,
    ino: 0,
    mode: 0,
    nlink: 0,
    uid: 0,
    gid: 0,
    rdev: 0,
    size: 0,
    blksize: 0,
    blocks: 0,
    atimeMs: 0,
    mtimeMs: 0,
    ctimeMs: 0,
    birthtimeMs: 0,
    atime: new Date(),
    mtime: new Date(),
    ctime: new Date(),
    birthtime: new Date(),
    ...overrides,
  } as Stats;
}


// Mock dependencies
vi.mock('node:fs/promises');
vi.mock('../config/index.js');
vi.mock('ora');

// Mock SUPPORTED_AGENTS inside apply logic.
// Since apply.ts imports SUPPORTED_AGENTS directly, we need to mock that module.
vi.mock('../agents/base.js', () => ({
  SUPPORTED_AGENTS: {
    'test-agent': {
        name: 'Test Agent',
        getSkillsDir: vi.fn(() => '/mock/skills/dir')
    }
  }
}));

describe('apply command', () => {
    let program: Command;
    let mockSpinner: { start: Mock; succeed: Mock; fail: Mock; warn: Mock; text: string };

    beforeEach(() => {
        vi.clearAllMocks();
        program = new Command();
        
        // Setup spinner mock
        mockSpinner = {
            start: vi.fn().mockReturnThis(),
            succeed: vi.fn(),
            fail: vi.fn(),
            warn: vi.fn(),
            text: ''
        };
        vi.mocked(ora).mockReturnValue(mockSpinner as any); // eslint-disable-line @typescript-eslint/no-explicit-any

        // Setup default config mock
        vi.mocked(configModule.loadConfig).mockResolvedValue({
            skills: {
                'demo-skill': { path: '/source/path' }
            },
            agents: ['test-agent']
        });
        
        // Setup fs mocks
        vi.mocked(fs.mkdir).mockResolvedValue(undefined);
        vi.mocked(fs.lstat).mockRejectedValue(new Error('ENOENT')); // Default: target doesn't exist
        vi.mocked(fs.symlink).mockResolvedValue(undefined);
        
        // Register the command
        registerApplyCommand(program);
    });

    it('should create symlink if target does not exist', async () => {
        await program.parseAsync(['node', 'test', 'apply']);
        
        expect(fs.symlink).toHaveBeenCalledWith('/source/path', '/mock/skills/dir/demo-skill', 'dir');
        expect(mockSpinner.succeed).toHaveBeenCalled();
    });

    it('should warn and skip if target exists and force is false', async () => {
        // Mock target existing
        vi.mocked(fs.lstat).mockResolvedValue(createMockStats({
             isSymbolicLink: () => false,
             isDirectory: () => true 
        }));

        await program.parseAsync(['node', 'test', 'apply']);
        
        expect(mockSpinner.warn).toHaveBeenCalledWith(expect.stringContaining('Conflict'));
        expect(fs.symlink).not.toHaveBeenCalled();
        expect(fs.rm).not.toHaveBeenCalled();
    });

    it('should overwrite if target exists and --force is true', async () => {
        // Mock target existing
        vi.mocked(fs.lstat).mockResolvedValue(createMockStats({
             isSymbolicLink: () => false,
             isDirectory: () => true 
        }));
        vi.mocked(fs.rm).mockResolvedValue(undefined);

        await program.parseAsync(['node', 'test', 'apply', '--force']);
        
        expect(fs.rm).toHaveBeenCalledWith('/mock/skills/dir/demo-skill', { recursive: true, force: true });
        expect(fs.symlink).toHaveBeenCalled();
    });
});
