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
	private refsPaths :string;
	private objectPath: string;
	private headPath: string;

	constructor(){
		this.trackItPath = path.resolve(process.cwd(), ".track-it");
		this.refsPaths = path.join(this.trackItPath, "refs")
		this.objectPath = path.join(this.trackItPath, "objects");
		this.headPath = path.join(this.trackItPath, "HEAD");
	}
}