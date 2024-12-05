import * as fs from 'fs-extra';
import * as path from 'path';
import { minimatch } from 'minimatch';
import StateManager from './stage';

class IgnoreManager {
  private ignorePath: string;
  private ignorePatterns: string[];

  constructor(rootDir: string = process.cwd()) {
    this.ignorePath = path.join(rootDir, '.ignore');
    this.ignorePatterns = this.loadIgnorePatterns();
  }

  /**
   * Load ignore patterns from .ignore file
   * @returns Array of ignore patterns
   */
  private loadIgnorePatterns(): string[] {
    if (!fs.existsSync(this.ignorePath)) {
      return [];
    }

    const content = fs.readFileSync(this.ignorePath, 'utf-8');
    return content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'));
  }

  /**
   * Check if a file should be ignored
   * @param filePath Path to the file
   * @returns Boolean indicating if file is ignored
   */
  public isFileIgnored(filePath: string): boolean {
    const relativePath = path.relative(process.cwd(), filePath);
    return this.ignorePatterns.some(pattern => 
      minimatch(relativePath, pattern, { dot: true })
    );
  }

  /**
   * Filter out ignored files from a list of files
   * @param files Array of file paths
   * @returns Filtered array of non-ignored files
   */
  public filterIgnoredFiles(files: string[]): string[] {
    return files.filter(file => !this.isFileIgnored(file));
  }
}

// Modify existing stage and commit commands to use ignore functionality
export function stageCommand(filePaths: string[]): void {
  try {
    const ignoreManager = new IgnoreManager();
    const filteredFiles = ignoreManager.filterIgnoredFiles(filePaths);

    if (filteredFiles.length === 0) {
      console.log('No files to stage (all files ignored)');
      return;
    }

    const stateManager = new StateManager();
    stateManager.stage(filteredFiles);
  } catch (error) {
    console.error('Staging failed:', error);
    process.exit(1);
  }
}

export default IgnoreManager;