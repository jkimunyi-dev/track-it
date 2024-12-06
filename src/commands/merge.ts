import * as fs from 'fs-extra';
import * as path from 'path';
import * as crypto from 'crypto';

interface StagedFile {
  path: string;
  hash: string;
}

interface CommitObject {
  timestamp: number;
  message: string;
  files: StagedFile[];
  parent?: string;
}

interface MergeConflict {
  filePath: string;
  currentBranchContent: string;
  mergeBranchContent: string;
}

class MergeManager {
  private trackItPath: string;
  private refsPath: string;
  private objectsPath: string;
  private headPath: string;

  constructor(baseDir: string = process.cwd()) {
    this.trackItPath = path.resolve(baseDir, ".trackit");
    this.refsPath = path.join(this.trackItPath, "refs");
    this.objectsPath = path.join(this.trackItPath, "objects");
    this.headPath = path.join(this.trackItPath, "HEAD");
  }


  /**
   * Get the current branch name
   * @returns Current branch name
   */
  private getCurrentBranch(): string {
    const headContent = fs.readFileSync(this.headPath, "utf-8").trim();
    return headContent.split("refs/heads/")[1] || "main";
  }

  /**
   * Get latest commit hash for a given branch
   * @param branchName Branch name (optional, defaults to current branch)
   * @returns Commit hash or undefined if no commits exist
   */
  private getLatestCommitHash(branchName?: string): string | undefined {
    const branch = branchName || this.getCurrentBranch();
    const branchRefPath = path.join(this.refsPath, "heads", branch);
    
    return fs.existsSync(branchRefPath) 
      ? fs.readFileSync(branchRefPath, "utf-8").trim() 
      : undefined;
  }

  /**
   * Read a commit object from the objects directory
   * @param commitHash Hash of the commit to read
   * @returns Parsed CommitObject
   */
  private readCommitObject(commitHash: string): CommitObject {
    const commitPath = path.join(this.objectsPath, commitHash);
    if (!fs.existsSync(commitPath)) {
      throw new Error(`Commit ${commitHash} not found`);
    }
    return JSON.parse(fs.readFileSync(commitPath, "utf-8"));
  }

  /**
   * Find the common ancestor commit between two branches
   * @param branch1 First branch name
   * @param branch2 Second branch name
   * @returns Commit hash of the common ancestor, or undefined if no common ancestor
   */
  private findCommonAncestor(branch1: string, branch2: string): string | undefined {
	const branch1CommitHash = this.getLatestCommitHash(branch1);
	const branch2CommitHash = this.getLatestCommitHash(branch2);
  
	if (!branch1CommitHash || !branch2CommitHash) {
	  return undefined;
	}
  
	// Linear ancestry search
	let currentCommitHash1: string | undefined = branch1CommitHash;
	while (currentCommitHash1) {
	  let currentCommitHash2: string | undefined = branch2CommitHash;
	  while (currentCommitHash2) {
		if (currentCommitHash1 === currentCommitHash2) {
		  return currentCommitHash1;
		}
		
		const parentCommit:any = this.readCommitObject(currentCommitHash2).parent;
		currentCommitHash2 = parentCommit;
	  }
	  
	  const parentCommit:any = this.readCommitObject(currentCommitHash1).parent;
	  currentCommitHash1 = parentCommit;
	}
  
	return undefined;
  }

  /**
   * Detect merge conflicts between two commit objects
   * @param currentBranchCommit Commit object from the current branch
   * @param mergeBranchCommit Commit object from the branch being merged
   * @returns Array of merge conflicts
   */
  private detectMergeConflicts(
    currentBranchCommit: CommitObject, 
    mergeBranchCommit: CommitObject
  ): MergeConflict[] {
    const conflicts: MergeConflict[] = [];

    // Create maps of files by their paths
    const currentBranchFiles = new Map(
      currentBranchCommit.files.map(file => [file.path, file])
    );
    const mergeBranchFiles = new Map(
      mergeBranchCommit.files.map(file => [file.path, file])
    );

    // Check for conflicting files
    for (const mergefile of mergeBranchFiles.values()) {
      const currentFile = currentBranchFiles.get(mergefile.path);

      // If the file exists in both branches with different hashes, it's a conflict
      if (currentFile && currentFile.hash !== mergefile.hash) {
        conflicts.push({
          filePath: mergefile.path,
          currentBranchContent: fs.readFileSync(path.join(this.objectsPath, currentFile.hash), 'utf-8'),
          mergeBranchContent: fs.readFileSync(path.join(this.objectsPath, mergefile.hash), 'utf-8')
        });
      }
    }

    return conflicts;
  }

  /**
   * Create a merge commit
   * @param fromBranch Branch to merge from
   * @param toBranch Branch to merge into (current branch)
   * @returns Merge commit hash
   */
  public merge(fromBranch: string): string {
    const currentBranch = this.getCurrentBranch();
    
    // Validate branches exist
    const fromBranchCommitHash = this.getLatestCommitHash(fromBranch);
    const currentBranchCommitHash = this.getLatestCommitHash();

    if (!fromBranchCommitHash) {
      throw new Error(`Branch '${fromBranch}' does not exist`);
    }

    if (!currentBranchCommitHash) {
      throw new Error('Cannot merge into a branch with no commits');
    }

    // Find common ancestor
    const commonAncestorHash = this.findCommonAncestor(currentBranch, fromBranch);

    // Read commit objects
    const currentBranchCommit = this.readCommitObject(currentBranchCommitHash);
    const fromBranchCommit = this.readCommitObject(fromBranchCommitHash);
    const commonAncestorCommit = commonAncestorHash 
      ? this.readCommitObject(commonAncestorHash) 
      : undefined;

    // Detect merge conflicts
    const mergeConflicts = this.detectMergeConflicts(currentBranchCommit, fromBranchCommit);

    // Prepare merge commit
    const mergeCommit: CommitObject = {
      timestamp: Date.now(),
      message: `Merge branch '${fromBranch}' into '${currentBranch}'`,
      files: [...currentBranchCommit.files],
      parent: currentBranchCommitHash
    };

    // If there are conflicts, mark them
    if (mergeConflicts.length > 0) {
      console.log('Merge conflicts detected:');
      mergeConflicts.forEach(conflict => {
        console.log(`
Conflict in file: ${conflict.filePath}
<<<<<<< ${currentBranch}
${conflict.currentBranchContent}
=======
${conflict.mergeBranchContent}
>>>>>>> ${fromBranch}
`);
      });

      console.log('Merge halted. Resolve conflicts manually before committing.');
      throw new Error('Merge conflicts exist');
    }

    // Generate merge commit hash
    const mergeCommitHash = this.hashCommitObject(mergeCommit);

    // Save merge commit
    const mergeCommitPath = path.join(this.objectsPath, mergeCommitHash);
    fs.writeFileSync(mergeCommitPath, JSON.stringify(mergeCommit, null, 2));

    // Update branch reference
    const branchRefPath = path.join(this.refsPath, "heads", currentBranch);
    fs.writeFileSync(branchRefPath, mergeCommitHash);

    console.log(`Merged branch '${fromBranch}' into '${currentBranch}'`);
    return mergeCommitHash;
  }

  /**
   * Hash a commit object to generate a unique identifier
   * @param commitObject Commit object to hash
   * @returns Commit hash
   */
  private hashCommitObject(commitObject: CommitObject): string {
    const hashSum = crypto.createHash("sha-256");
    hashSum.update(JSON.stringify(commitObject));
    return hashSum.digest("hex");
  }
}

/**
 * CLI Command for merging branches
 * @param fromBranch Branch to merge from
 */
export function mergeCommand(fromBranch: string): void {
  try {
    const mergeManager = new MergeManager();
    mergeManager.merge(fromBranch);
  } catch (error) {
    console.error("Merge failed:", error);
    process.exit(1);
  }
}

export default MergeManager;