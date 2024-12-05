import * as fs from 'fs-extra';
import * as path from 'path';

interface StagedFile{
	path: string
	hash : string
}

interface CommitObject{
	timestamp: number;
	message: string;
	files: StagedFile[];
	parent?: string;

}

class LogManager{
	private trackItPath: string
	private refsPath :string;
	private objectsPath: string;
	private headPath: string;

	constructor(){
		this.trackItPath = path.resolve(process.cwd(), ".track-it");
		this.refsPath = path.join(this.trackItPath, "refs")
		this.objectsPath = path.join(this.trackItPath, "objects");
		this.headPath = path.join(this.trackItPath, "HEAD");
	}

	/**
   * Get the current branch name from HEAD
   * @returns Current branch name
   */
	private getCurrentBranch(): string {
		const headContent = fs.readFileSync(this.headPath, "utf-8").trim();
		return headContent.split("refs/heads/")[1] || "main";
	  }
	

	/**
   * Get latest commit hash for the current branch
   * @returns Commit hash or undefined if no commits exist
   */
	private getLatestCommitHash(): string | undefined {
		const branchRefPath = path.join(this.refsPath, "heads", this.getCurrentBranch());
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
	 * Display commit history starting from the latest commit
	 * @param maxCommits Maximum number of commits to display (default : unlimited)
	 */

	public log(maxCommits? :number): void{
		let currentCommitHash = this.getLatestCommitHash()

		if (!currentCommitHash) {
			console.log("No commits found in the current repository.");
			return;
		}

		let commitCount = 0;
		while (currentCommitHash && (maxCommits === undefined || commitCount < maxCommits)) {
			const commitObject = this.readCommitObject(currentCommitHash);

			// Format date
			const date = new Date(commitObject.timestamp);
      
			// Display commit information
			console.log(`commit ${currentCommitHash}`);
			console.log(`Date: ${date.toLocaleString()}`);
			console.log(`Message: ${commitObject.message}`);
			console.log(`Files changed: ${commitObject.files.length}`);
			console.log('Changed files:');
			commitObject.files.forEach(file => {
			  console.log(`  - ${file.path} (${file.hash})`);
			});
			console.log('\n');
	  
			// Move to parent commit
			currentCommitHash = commitObject.parent;
			commitCount++;
	  
		}

	  
	}
}