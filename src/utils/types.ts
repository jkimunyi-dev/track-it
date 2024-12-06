export interface FileInfo {
	path: string;
	hash: string;
  }
  
  export interface CommitObject {
	files: FileInfo[];
	timestamp: string;
	message: string;
  }