import * as fs from 'fs-extra';
import * as path from 'path';
import { minimatch } from 'minimatch';
import StateManager from './stage';

class IgnoreManager {
  private ignorePath: string;
  private ignorePatterns: string[];

  constructor(rootDir: string = process.cwd()) {
    this.ignorePath = path.join(rootDir, '.track-itignore');
    this.ignorePatterns = this.loadIgnorePatterns();
  }

  /**
   * Load ignore patterns from .track-itignore file
   * @returns Array of ignore patterns
   */
  private loadIgnorePatterns(): string[] {
    try {
      if (!fs.existsSync(this.ignorePath)) {
        return [];
      }

      const content = fs.readFileSync(this.ignorePath, 'utf-8');
      return content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'));
    } catch (error) {
      console.error('Error reading ignore file:', error);
      return [];
    }
  }

  /**
   * Check if a file should be ignored
   * @param filePath Path to the file
   * @returns Boolean indicating if file is ignored
   */
  public isFileIgnored(filePath: string): boolean {
    const relativePath = path.relative(process.cwd(), filePath);
    return this.ignorePatterns.some(pattern => 
      minimatch(relativePath, pattern, { 
        dot: true,      // Allow matching of dotfiles
        matchBase: true,  // Match basename against pattern
        nobrace: true,   // Disable brace expansion
        noext: true,     // Disable extglob
        flipNegate: false  // Ensure negative patterns are handled correctly
      }) ||
      this.ignorePatterns.some(p => 
        // Check if the file is inside an ignored directory
        minimatch(relativePath, `${p}/**`, { 
          dot: true,
          matchBase: true,
          nobrace: true,
          noext: true
        })
      )
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

  /**
   * Add new ignore patterns to the .track-itignore file
   * @param patterns Patterns to ignore
   */
  public addIgnorePatterns(patterns: string[]): void {
    try {
      // Read existing patterns
      const existingPatterns = this.loadIgnorePatterns();

      // Filter out duplicate patterns
      const newPatterns = patterns.filter(pattern => 
        !existingPatterns.includes(pattern)
      );

      if (newPatterns.length === 0) {
        console.log('All specified patterns are already ignored');
        return;
      }

      // Combine existing and new patterns
      const updatedPatterns = [
        ...existingPatterns,
        ...newPatterns
      ];

      // Write back to file
      fs.writeFileSync(
        this.ignorePath, 
        updatedPatterns.join('\n') + '\n'
      );

      console.log('Updated ignore patterns:');
      newPatterns.forEach(pattern => console.log(`+ ${pattern}`));

      // Reload ignore patterns
      this.ignorePatterns = this.loadIgnorePatterns();
    } catch (error) {
      console.error('Failed to update ignore patterns:', error);
    }
  }

  /**
   * Get current ignore patterns
   * @returns Array of current ignore patterns
   */
  public getIgnorePatterns(): string[] {
    return this.ignorePatterns;
  }
}

export default IgnoreManager;