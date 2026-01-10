import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Command } from 'commander';
import { registerApplyCommand } from './apply.js';
import * as configModule from '../config/index.js';
import fs from 'node:fs/promises';
import ora from 'ora';

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
    let mockSpinner: any;

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
        (ora as any).mockReturnValue(mockSpinner);

        // Setup default config mock
        (configModule.loadConfig as any).mockResolvedValue({
            skills: {
                'demo-skill': { path: '/source/path' }
            },
            agents: ['test-agent']
        });
        
        // Setup fs mocks
        (fs.mkdir as any).mockResolvedValue(undefined);
        (fs.lstat as any).mockRejectedValue(new Error('ENOENT')); // Default: target doesn't exist
        (fs.symlink as any).mockResolvedValue(undefined);
        
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
        (fs.lstat as any).mockResolvedValue({
             isSymbolicLink: () => false,
             isDirectory: () => true 
        });

        await program.parseAsync(['node', 'test', 'apply']);
        
        expect(mockSpinner.warn).toHaveBeenCalledWith(expect.stringContaining('Conflict'));
        expect(fs.symlink).not.toHaveBeenCalled();
        expect(fs.rm).not.toHaveBeenCalled();
    });

    it('should overwrite if target exists and --force is true', async () => {
        // Mock target existing
        (fs.lstat as any).mockResolvedValue({
             isSymbolicLink: () => false,
             isDirectory: () => true 
        });
        (fs.rm as any).mockResolvedValue(undefined);

        await program.parseAsync(['node', 'test', 'apply', '--force']);
        
        expect(fs.rm).toHaveBeenCalledWith('/mock/skills/dir/demo-skill', { recursive: true, force: true });
        expect(fs.symlink).toHaveBeenCalled();
    });
});
