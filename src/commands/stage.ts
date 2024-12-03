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
}