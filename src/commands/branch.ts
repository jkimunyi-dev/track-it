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
}
