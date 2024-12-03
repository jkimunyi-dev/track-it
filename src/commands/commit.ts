import * as fs from 'fs-extra';
import * as path from 'path';
import * as crypto from 'crypto';

interface StagedFile {
  path: string;
  hash: string;
}

interface CommitObject{
	timestamp: number;
	mesasge: string;
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
	 * Create a commit object and save it
	 * @param message Commit message
	 * @returns Commit hash
	 */

	public commit(message: string): string{
		// Ensure there are staged files
		const stagedFiles = this.readStagedFiles();
		return ""
	}
}

/**
 * CLI Command for creating a commit
 * @param message Commit message
 */

export function commitCommand(message: string): void{
	try {
		if(!message){
			throw new Error("Commit message is required");
		}

		const commitManager = new CommitManager();
		
	} catch (error) {
		console.error("Commit Failed : ", error);
		process.exit(1);
	}
}