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

