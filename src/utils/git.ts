import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

const execAsync = promisify(exec);

export interface GitSource {
  url: string;
  branch?: string;
  path?: string;
}

export function parseGitHubUrl(url: string): GitSource | null {
  // Handle github.com/owner/repo/tree/branch/path or /blob/branch/path
  const httpsMatch = url.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+)(?:\/(?:tree|blob)\/([^/]+)\/(.+))?$/);
  if (httpsMatch) {
    return {
      url: `https://github.com/${httpsMatch[1]}/${httpsMatch[2].replace(/\.git$/, '')}.git`,
      branch: httpsMatch[3],
      path: httpsMatch[4],
    };
  }
  
  // Handle git@github.com:owner/repo.git
  return null;
}

export async function installFromGit(source: string, dest: string): Promise<void> {
    const gitSource = parseGitHubUrl(source);
    
    if (gitSource && gitSource.path) {
        // Sparse checkout for subdirectory
        const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'mskills-git-'));
        try {
            await execAsync('git init', { cwd: tempDir });
            await execAsync(`git remote add origin ${gitSource.url}`, { cwd: tempDir });
            
            // Enable sparse checkout
            await execAsync('git config core.sparseCheckout true', { cwd: tempDir });
            
            // Set the path to checkout
            await execAsync(`git sparse-checkout set "${gitSource.path}"`, { cwd: tempDir });
            
            // Pull the specific branch with depth 1
            const branch = gitSource.branch || 'main'; 
            await execAsync(`git pull origin ${branch} --depth 1`, { cwd: tempDir });
            
            const sourcePath = path.join(tempDir, gitSource.path);
            // Verify sourcePath exists
            try {
                await fs.access(sourcePath);
            } catch {
                throw new Error(`Path '${gitSource.path}' not found in repository.`);
            }

            await fs.cp(sourcePath, dest, { recursive: true });
        } finally {
            await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
        }
    } else {
        throw new Error('Installing from repository root is not supported. Please specify a subdirectory containing the skill (e.g. /tree/main/skill).');
    }
}

export async function pullRepo(path: string) {
  await execAsync(`git -C ${path} pull`);
}

export function isGitUrl(url: string): boolean {
  return url.startsWith('git@') || url.startsWith('http://') || url.startsWith('https://');
}
