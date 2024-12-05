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
	private objectPath: string;
	private headPath: string;

	constructor(){
		this.trackItPath = path.resolve(process.cwd(), ".track-it");
		this.refsPath = path.join(this.trackItPath, "refs")
		this.objectPath = path.join(this.trackItPath, "objects");
		this.headPath = path.join(this.trackItPath, "HEAD");
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
	 * Display commit history starting from the latest commit
	 * @param maxCommits Maximum number of commits to display (default : unlimited)
	 */

	public log(maxCommits? :number): void{
		let currentCommit = getLatestCommitHash()
	}
}