import * as fs from 'fs-extra';
import * as path from 'path';
import { initRepository } from './init';
import { stageCommand } from './stage';
import { commitCommand } from './commit';
import BranchManager from './branch';

describe('Branch Management', () => {
  let tempRepoPath: string;
  let originalCwd: string;
  let branchManager: BranchManager;

  beforeEach(() => {
    // Save current working directory
    originalCwd = process.cwd();
    
    // Create a temporary repository
    tempRepoPath = path.join(__dirname, 'temp-repo-' + Date.now());
    fs.mkdirSync(tempRepoPath);
    process.chdir(tempRepoPath);

    // Initialize repository
    initRepository();

    // Create a test file and commit
    const testFilePath = path.join(tempRepoPath, 'test.txt');
    fs.writeFileSync(testFilePath, 'Hello, world!');
    stageCommand([testFilePath]);
    commitCommand('Initial commit');

    // Initialize branch manager
    branchManager = new BranchManager();
  });

  afterEach(() => {
    // Restore original working directory
    process.chdir(originalCwd);
    
    // Cleanup temp directory
    fs.removeSync(tempRepoPath);
  });

  it('should create a new branch', () => {
    // Create a new branch
    branchManager.createBranch('test-branch');

    // Check branch reference exists
    const branchPath = path.join(tempRepoPath, '.track-it', 'refs', 'heads', 'test-branch');
    expect(fs.existsSync(branchPath)).toBe(true);
  });

  it('should not create a branch with invalid name', () => {
    expect(() => {
      branchManager.createBranch('test branch');
    }).toThrow('Invalid branch name');
  });

  it('should not create an existing branch', () => {
    // Create first branch
    branchManager.createBranch('test-branch');

    // Attempt to create same branch again
    expect(() => {
      branchManager.createBranch('test-branch');
    }).toThrow("Branch 'test-branch' already exists");
  });

  it('should checkout a branch', () => {
    // Create a new branch
    branchManager.createBranch('test-branch');
    
    // Checkout the new branch
    branchManager.checkout('test-branch');

    // Check HEAD file
    const headPath = path.join(tempRepoPath, '.track-it', 'HEAD');
    const headContent = fs.readFileSync(headPath, 'utf-8').trim();
    
    expect(headContent).toBe('ref: refs/heads/test-branch');
  });

  it('should not checkout a non-existing branch', () => {
    expect(() => {
      branchManager.checkout('non-existing-branch');
    }).toThrow("Branch 'non-existing-branch' does not exist");
  });
});