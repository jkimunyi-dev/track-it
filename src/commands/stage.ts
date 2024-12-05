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
	 * Compute SHA-245 hash of file content
	 * @param filePath Path to the file to hash
	 * @returns Computed hash string
	 */

	private computeHashFile(filePath : string): string {
		const fileBuffer = fs.readFileSync(filePath);
		const hashSum = crypto.createHash("sha-256");
		hashSum.update(fileBuffer);
		return hashSum.digest("hex");
	}

	/**
	 * Save fileblob in objects directory
	 * @param filePath Path to the file to save
	 * @param hash Computed hash of the file
	 */

	private saveFileBlob(filePath : string, hash : string): void{
		const blobPath = path.join(this.objectsPath, hash);
		fs.copyFileSync(filePath, blobPath)
	}

	/**
	 * Update the index file with staged files
	 * @param stagedFiles List of staged files
	 */

	private updateIndex(stagedFiles : StagedFile[]): void{
		const indexContent = JSON.stringify(stagedFiles, null, 2)
		fs.writeFileSync(this.indexPath, indexContent)
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

		// Process all staged files
		filePaths.forEach(filePath=>{
			// Validate file exists
			if(!fs.existsSync(filePath)){
				console.error(`File not found: ${filePath}`);
				return;
			}
			
			// Compute file hash 
			const fileHash = this.computeHashFile(filePath);

			// Save file blob

			this.saveFileBlob(filePath, fileHash)

			// Update / add to staged files

			const existingFileIndex = stagedFiles.findIndex(f => f.path === filePath);
			const stagedFile: StagedFile = {path : filePath, hash: fileHash};

			if(existingFileIndex !== -1){
				stagedFiles[existingFileIndex] = stagedFile;
			}else{
				stagedFiles.push(stagedFile)
			}

			console.log(`Staged: ${filePath} (${fileHash})`);
		});

		// Update index

		this.updateIndex(stagedFiles);
	}

}
/**
 * CLI Command for staging files
 * @param filePaths Files to stage
 */

export function stageCommand(filePaths: string[]):void{
	try{
		const stateManager = new StateManager();
		stateManager.stage(filePaths);

	}catch(error){
		console.log("Staging failed: ", error);
		process.exit(1);
	}
}

export default StateManager;