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
}