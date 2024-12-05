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
    * Get the current branch name
    * @returns Current branch name
    */
	public getCurrentBranch(): string {
		const headContent = fs.readFileSync(this.headPath, "utf-8").trim();
		return headContent.split("refs/heads/")[1] || "main";
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
    * Switch to a different branch
    * @param branchName Name of the branch to switch to
    */
	public checkout(branchName: string): void {
		const branchPath = path.join(this.refsPath, branchName);
		
		// Check if branch exists
		if (!fs.existsSync(branchPath)) {
		  throw new Error(`Branch '${branchName}' does not exist`);
		}
	
		// Update HEAD to point to the new branch
		const newHeadContent = `ref: refs/heads/${branchName}`;
		fs.writeFileSync(this.headPath, newHeadContent);
	
		console.log(`Switched to branch: ${branchName}`);
	}

	/**
    * List all branches
    * @returns Array of branch names
    */
	public listBranches(): string[] {
		// Ensure refs/heads directory exists
		fs.ensureDirSync(this.refsPath);
	
		// Read all branch files
		const branches = fs.readdirSync(this.refsPath);
		
		return branches.map(branch => {
		  const isCurrentBranch = branch === this.getCurrentBranch();
		  return isCurrentBranch ? `* ${branch}` : branch;
		});
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

		// Create branch reference file with current commit hash
		fs.ensureDirSync(this.refsPath);
		if (currentCommitHash) {
		  fs.writeFileSync(branchPath, currentCommitHash);
		} else {
		  // If no commits exist, create an empty file
		  fs.writeFileSync(branchPath, '');
		}
	
		console.log(`Created branch: ${branchName}`);
	
	}
}

/**
* CLI Command for creating a new branch
* @param branchName Name of the new branch
*/
export function branchCommand(branchName: string): void {
	try {
	  const branchManager = new BranchManager();
	  branchManager.createBranch(branchName);
	} catch (error) {
	  console.error("Branch creation failed:", error);
	  process.exit(1);
	}
}
  
/**
 * CLI Command for checking out a branch
 * @param branchName Name of the branch to switch to
 */
export function checkoutCommand(branchName: string): void {
	try {
	  const branchManager = new BranchManager();
	  branchManager.checkout(branchName);
	} catch (error) {
	  console.error("Branch checkout failed:", error);
	  process.exit(1);
	}
  }
  
/**
 * CLI Command for listing branches
 */
export function branchListCommand(): void {
	try {
	  const branchManager = new BranchManager();
	  const branches = branchManager.listBranches();
	  console.log("Branches:");
	  branches.forEach(branch => console.log(branch));
	} catch (error) {
	  console.error("Failed to list branches:", error);
	  process.exit(1);
	}
  }
  
  export default BranchManager;
  