import * as fs from 'fs-extra';
import * as path from 'path';
import * as crypto from 'crypto';

interface StagedFile {
  path: string;
  hash: string;
}

interface CommitObject{
	timestamp: number;
	message: string;
	files : StagedFile[];
	parent?: string; // Optional reference to previous commit
}

class CommitManager{
	private trackItPath: string;
	private refsPath: string;
	private objectsPath: string;
	private indexPath: string;
	private headPath: string;

	constructor(){
		this.trackItPath = path.resolve(process.cwd(), ".track-it");
		this.refsPath = path.join(this.trackItPath, "refs");
		this.objectsPath = path.join(this.trackItPath, "objects")
		this.indexPath = path.join(this.trackItPath, "index");
		this.headPath = path.join(this.trackItPath, "HEAD");

		// Ensure all necessary directories exist
		this.initializeRepositoryStructure();
	}

	private initializeRepositoryStructure(): void {
		// Ensure .track-it directory exists
		fs.ensureDirSync(this.trackItPath);
		
		// Ensure refs/heads directory exists
		fs.ensureDirSync(path.join(this.refsPath, "heads"));
		
		// Ensure objects directory exists
		fs.ensureDirSync(this.objectsPath);

		// Ensure HEAD file exists with default branch
		if (!fs.existsSync(this.headPath)) {
			const defaultHeadContent = "ref: refs/heads/main";
			fs.writeFileSync(this.headPath, defaultHeadContent);
		}

		// Ensure index file exists and is an empty array
		if (!fs.existsSync(this.indexPath)) {
			fs.writeFileSync(this.indexPath, "[]");
		}
	}

	/**
	 * Read currently staged files from index
	 * @returns Array of staged files
	 */
	private readStagedFiles(): StagedFile[]{
		if(!fs.existsSync(this.indexPath)){
			return []
		}
		return JSON.parse(fs.readFileSync(this.indexPath, "utf-8"))
	}

	/**
	 * Get the current branch name of the HEAD
	 * @returns Current branch name
	 */
	private getCurrentBranch(): string {
		const headContent = fs.readFileSync(this.headPath, "utf-8").trim();
		
		return headContent.split("refs/heads/")[1] || "main";
	}

	/**
	 * Get latest commit hash for the current branch
	 * @returns Commit hash or undefined if there are no previous commits
	 */
	private getLatestCommitHash(): string | undefined{
		const branchRefPath = path.join(this.refsPath, "heads", this.getCurrentBranch());

		return fs.existsSync(branchRefPath) 
		? fs.readFileSync(branchRefPath, "utf-8").trim() 
		: undefined
	}

	/**
	 * Hash a commit object to generate a unique identifier
	 * @param commitObject Commit object to hash
	 * @returns Commit hash
	 */
	private hashCommitObject(commitObject : CommitObject): string{
		const hashSum = crypto.createHash("sha256");
		hashSum.update(JSON.stringify(commitObject));
		
		return hashSum.digest("hex");
	}

	/**
	 * Read a commit object
	 * @param commitHash Hash of the commit to read
	 * @returns Commit object
	 */
	public readCommitObject(commitHash: string): CommitObject {
		const commitPath = path.join(this.objectsPath, commitHash);
		if (!fs.existsSync(commitPath)) {
		  throw new Error(`Commit ${commitHash} not found`);
		}
		return JSON.parse(fs.readFileSync(commitPath, "utf-8"));
	}

	/**
	 * Create a commit
	 * @param message Commit message
	 * @returns Commit hash
	 */
	public commit(message: string): string{
		// Ensure there are staged files
		const stagedFiles = this.readStagedFiles();
		if(stagedFiles.length ===0){
			throw new Error("No changes staged for commit");
		}

		// Create a commit object
		const commitObject: CommitObject = {
			timestamp : Date.now(),
			message,
			files : stagedFiles,
			parent : this.getLatestCommitHash()
		}

		// Generate commit hash
		const commitHash = this.hashCommitObject(commitObject);

		// Save commit object
		const commitPath = path.join(this.objectsPath, commitHash);
		fs.writeFileSync(commitPath, JSON.stringify(commitObject, null, 2));

		// Update branch reference
		const currentBranch = this.getCurrentBranch();
		const branchRefPath = path.join(this.refsPath, "heads", currentBranch);
		
		// Ensure the heads directory exists
		fs.ensureDirSync(path.dirname(branchRefPath));
		
		// Write the commit hash to the branch reference
		fs.writeFileSync(branchRefPath, commitHash);

		// Clear the index
		fs.writeFileSync(this.indexPath, "[]");
		
		console.log(`Committed changes: ${commitHash}`);
    	return commitHash;
	}
}

/**
 * CLI Command for creating a commit
 * @param message Commit message
 */
export function commitCommand(message: string): void {
    
        if(!message){
            throw new Error("Commit message is required");
        }

        const commitManager = new CommitManager();
        commitManager.commit(message); // Actually call the commit method
    
}

export default CommitManager;