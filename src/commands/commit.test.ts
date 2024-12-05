import * as fs from 'fs-extra';
import * as path from 'path';
import { initRepository } from './init';
import { stageCommand } from './stage';
import { commitCommand } from './commit';

describe('Committing Changes', () => {
  let tempRepoPath: string;
  let originalCwd: string;

  beforeEach(() => {
    // Save current working directory
    originalCwd = process.cwd();
    
    // Create a temporary repository
    tempRepoPath = path.join(__dirname, 'temp-repo-' + Date.now());
    fs.mkdirSync(tempRepoPath);
    process.chdir(tempRepoPath);

    // Initialize repository
    initRepository();
  });

  afterEach(() => {
    // Restore original working directory
    process.chdir(originalCwd);
    
    // Cleanup temp directory
    fs.removeSync(tempRepoPath);
  });

  it('should commit staged changes', () => {
    // Create a test file
    const testFilePath = path.join(tempRepoPath, 'test.txt');
    fs.writeFileSync(testFilePath, 'Hello, world!');

    // Stage the test file
    stageCommand([testFilePath]);

    // Commit changes
    commitCommand('Initial commit');

    // Check refs directory
    const refsPath = path.join(tempRepoPath, '.track-it', 'refs', 'heads', 'main');
    const commitHash = fs.readFileSync(refsPath, 'utf-8').trim();

    // Verify commit object exists
    const commitPath = path.join(tempRepoPath, '.track-it', 'objects', commitHash);
    expect(fs.existsSync(commitPath)).toBe(true);

    // Verify commit content
    const commitContent = JSON.parse(fs.readFileSync(commitPath, 'utf-8'));
    expect(commitContent.message).toBe('Initial commit');
    expect(commitContent.files[0].path).toBe(testFilePath);
  });

  it('should not commit without staged files', () => {
    // Attempt to commit without staging
    expect(() => {
      commitCommand('Empty commit');
    }).toThrow('No changes staged for commit');
  });

  it('should clear index after commit', () => {
    // Create a test file
    const testFilePath = path.join(tempRepoPath, 'test.txt');
    fs.writeFileSync(testFilePath, 'Hello, world!');

    // Stage the test file
    stageCommand([testFilePath]);

    // Commit changes
    commitCommand('Initial commit');

    // Check index is cleared
    const indexPath = path.join(tempRepoPath, '.track-it', 'index');
    const indexContent = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
    expect(indexContent.length).toBe(0);
  });
});