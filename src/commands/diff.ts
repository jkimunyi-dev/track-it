import * as fs from 'fs-extra';
import * as path from 'path';
import { diff_match_patch } from 'diff-match-patch';
import CommitManager from './commit';

interface FileInfo {
  path: string;
  hash: string;
}

interface DiffResult {
  filePath: string;
  differences: string[];
}

export class DiffManager {
  private trackItPath: string;
  private objectsPath: string;
  private commitManager: CommitManager;

  constructor(pathResolver = path.resolve) {
    this.trackItPath = pathResolver(process.cwd(), '.trackit');
    this.objectsPath = path.join(this.trackItPath, 'objects');
    this.commitManager = new CommitManager();
  }

  /**
   * Read file content from objects directory by its hash
   * @param fileHash Hash of the file
   * @returns File content as string
   */
  private readFileContentByHash(fileHash: string): string {
    const filePath = path.join(this.objectsPath, fileHash);
    if (!fs.existsSync(filePath)) {
      throw new Error(`File with hash ${fileHash} not found`);
    }
    return fs.readFileSync(filePath, 'utf-8');
  }

  /**
   * Compare two files and generate line-by-line differences
   * @param hash1 First file hash
   * @param hash2 Second file hash
   * @returns Differences between files
   */
  public compareFiles(hash1: string, hash2: string): string[] {
    const content1 = this.readFileContentByHash(hash1);
    const content2 = this.readFileContentByHash(hash2);

    const lines1 = content1.split('\n');
    const lines2 = content2.split('\n');

    const lineDiffs: string[] = [];
    const maxLength = Math.max(lines1.length, lines2.length);

    for (let i = 0; i < maxLength; i++) {
      const line1 = lines1[i] || '';
      const line2 = lines2[i] || '';

      if (line1 !== line2) {
        if (line1 && line2) {
          // Line changed
          lineDiffs.push(`  ${line1}`);
          lineDiffs.push(`- ${line1}`);
          lineDiffs.push(`+ ${line2}`);
        } else if (line1) {
          // Line removed
          lineDiffs.push(`- ${line1}`);
        } else if (line2) {
          // Line added
          lineDiffs.push(`+ ${line2}`);
        }
      } else if (line1) {
        // Unchanged line
        lineDiffs.push(`  ${line1}`);
      }
    }

    return lineDiffs;
  }


  /**
   * Diff between commits
   * @param commit1Hash First commit hash
   * @param commit2Hash Second commit hash
   * @returns Detailed diff results
   */
  public diffCommits(commit1Hash: string, commit2Hash: string): DiffResult[] {
    // Use the method from the imported CommitManager
    const commit1 = this.commitManager.readCommitObject(commit1Hash);
    const commit2 = this.commitManager.readCommitObject(commit2Hash);

    const diffResults: DiffResult[] = [];

    // Map files by their paths for both commits
    const commit1FileMap = new Map(commit1.files.map(f => [f.path, f.hash]));
    const commit2FileMap = new Map(commit2.files.map(f => [f.path, f.hash]));

    // Check files in first commit
    commit1.files.forEach((file: FileInfo) => {
      const file2Hash = commit2FileMap.get(file.path);
      if (file2Hash && file2Hash !== file.hash) {
        // Files exist in both commits and have different hashes
        const differences = this.compareFiles(file.hash, file2Hash);
        diffResults.push({
          filePath: file.path,
          differences
        });
      }
    });

    // Check for new files in second commit
    commit2.files.forEach((file: FileInfo) => {
      if (!commit1FileMap.has(file.path)) {
        diffResults.push({
          filePath: file.path,
          differences: [`+ New file: ${file.path}`]
        });
      }
    });

    return diffResults;
  }
}

/**
 * CLI Command for comparing files or commits
 * @param args Diff arguments (file hashes or commit hashes)
 */
export function diffCommand(...args: string[]): void {
  try {
    const diffManager = new DiffManager();
    
    if (args.length === 2) {
      // Compare two file hashes
      const differences = diffManager.compareFiles(args[0], args[1]);
      console.log('File Differences:');
      differences.forEach(diff => console.log(diff));
    } else if (args.length === 3 && args[0] === 'commits') {
      // Compare two commits
      const commitDiffs = diffManager.diffCommits(args[1], args[2]);
      commitDiffs.forEach(result => {
        console.log(`Differences in ${result.filePath}:`);
        result.differences.forEach(diff => console.log(diff));
        console.log('\n');
      });
    } else {
      console.error('Invalid diff command. Use: diff <hash1> <hash2> or diff commits <commit1> <commit2>');
      process.exit(1);
    }
  } catch (error) {
    console.error('Diff failed:', error);
    process.exit(1);
  }
}

export default DiffManager;