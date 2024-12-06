import * as fs from 'fs-extra';
import * as path from 'path';

export function initRepository(): void {
  // Use .trackit instead of .git
  const repoPath = path.resolve(process.cwd(), '.trackit');
  const ignoreFilePath = path.resolve(process.cwd(), '.trackitignore');
  
  try {
    // Create repository directories
    fs.mkdirSync(repoPath, { recursive: true });
    fs.mkdirSync(path.join(repoPath, 'objects'), { recursive: true });
    fs.mkdirSync(path.join(repoPath, 'refs'), { recursive: true });

    // Create HEAD file with correct reference format
    fs.writeFileSync(path.join(repoPath, 'HEAD'), 'ref: refs/heads/main');

    // Create .trackitignore file with default entries
    const defaultIgnoreContent = `
		# Default trackit ignore file
		node_modules/
		.DS_Store
		*.log
		dist/
		`;
    fs.writeFileSync(ignoreFilePath, defaultIgnoreContent);

    console.log('trackit repository initiated successfully');
    console.log('Created .trackit directory and .trackitignore file');
  } catch (error) {
    console.error('Failed to initialize trackit repository:', error);
    process.exit(1);
  }
}