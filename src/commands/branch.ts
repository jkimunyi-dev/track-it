import * as fs from "fs-extra"
import * as path from "path"

class BranchManager{
	private trackItPath: string;
	private refsPath: string;
	private headPath: string;

	constructor(){
		this.trackItPath = path.resolve(process.cwd(), ".track.it")
		this.refsPath = path.join(this.trackItPath, "refs");
		this.headPath = path.join(this.trackItPath, "HEAD");
	}

	/**
	 * Get the latest commit hash for a given branch
	 * @param branchName Branch name
	 * @returns Commit hash or undefined if no commits exist
	 */
	public getLatestCommitHash(branchName?: string): string | undefined {
		const branch = branchName || this.getCurrentBranch();
		const branchRefPath = path.join(this.refsPath, branch);
		
		return fs.existsSync(branchRefPath) 
		  ? fs.readFileSync(branchRefPath, "utf-8").trim() 
		  : undefined;
	}
	

	/**
   	* Create a new branch
    * @param branchName Name of the new branch
    */
	public createBranch(branchName: string): void {
		// Validate branch name
		if (!/^[a-zA-Z0-9_-]+$/.test(branchName)) {
			throw new Error(`Invalid branch name: ${branchName}`);
		}
		const branchPath = path.join(this.refsPath, branchName);

		//Check if branch already exists
		if (fs.existsSync(branchPath)) {
			throw new Error(`Branch '${branchName}' already exists`);
		}

		// Get current commit hash
		const currentCommitHash = this.getLatestCommitHash();

  
	}
}
