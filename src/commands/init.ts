import * as fs from 'fs-extra';
import * as path from 'path';

export function initRepository(): void {
  // Use .track-it instead of .git
  const repoPath = path.resolve(process.cwd(), '.track-it');
  const ignoreFilePath = path.resolve(process.cwd(), '.track-itignore');
  
  try {
    // Create repository directories
    fs.mkdirSync(repoPath, { recursive: true });
    fs.mkdirSync(path.join(repoPath, 'objects'), { recursive: true });
    fs.mkdirSync(path.join(repoPath, 'refs'), { recursive: true });

    // Create HEAD file with correct reference format
    fs.writeFileSync(path.join(repoPath, 'HEAD'), 'ref: refs/heads/main');

    // Create .track-itignore file with default entries
    const defaultIgnoreContent = `
		# Default Track-It ignore file
		node_modules/
		.DS_Store
		*.log
		dist/
		`;
    fs.writeFileSync(ignoreFilePath, defaultIgnoreContent);

    console.log('Track-It repository initiated successfully');
    console.log('Created .track-it directory and .track-itignore file');
  } catch (error) {
    console.error('Failed to initialize Track-It repository:', error);
    process.exit(1);
  }
}