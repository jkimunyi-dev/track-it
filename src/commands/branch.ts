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
   	* Create a new branch
    * @param branchName Name of the new branch
    */
	public createBranch(branchName: string): void {
    // Validate branch name
    if (!/^[a-zA-Z0-9_-]+$/.test(branchName)) {
		throw new Error(`Invalid branch name: ${branchName}`);
	  }
	  
	}
}
