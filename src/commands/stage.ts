import * as fs from 'fs-extra';
import * as path from 'path';
import * as crypto from 'crypto';

interface StagedFile {
  path: string;
  hash: string;
}


class StateManager{
	private trackItPath: string;
	private indexPath: string;
	private objectsPath: string;

	constructor(){
		this.trackItPath = path.resolve(process.cwd(), ".track-it");
		this.indexPath = path.join(this.trackItPath, "index");
		this.objectsPath = path.join(this.trackItPath, "objects");
	}


	/**
	 * Stage a single or multiple files
	 * @param filePaths File paths to stage
	 */
	public stage(filePaths: string[]): void{
		// Ensure .track-it/objects exists
		fs.ensureDirSync(this.objectsPath);

		// Read existing index or initialize
		let stagedFiles: StagedFile[] = [];
		if(fs.existsSync(this.indexPath)){
			stagedFiles = JSON.parse(fs.readFileSync(this.indexPath, "utf-8"));
		}
	}
}