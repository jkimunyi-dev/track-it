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