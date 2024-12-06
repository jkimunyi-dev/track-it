import * as fs from 'fs-extra';
import * as path from 'path';
import BranchManager from '../commands/branch';

describe('Branch Management', () => {
  let tempRepoPath: string;
  let branchManager: BranchManager;

  beforeEach(() => {
    // Create a unique temporary directory for each test
    tempRepoPath = fs.mkdtempSync(path.join(process.cwd(), 'test-repo-'));
    
    // Mock process.cwd() to return our temporary directory
    jest.spyOn(process, 'cwd').mockReturnValue(tempRepoPath);
    
    // Create a new BranchManager instance
    branchManager = new BranchManager();
  });

  afterEach(() => {
    // Clean up the temporary directory
    fs.removeSync(tempRepoPath);
    
    // Restore mocks
    jest.restoreAllMocks();
  });

  it('should create a new branch', () => {
    // First, create an initial commit (simulated)
    const initialCommitHash = 'abc123';
    const branchesPath = path.join(tempRepoPath, '.track.it', 'refs', 'heads');
    fs.ensureDirSync(branchesPath);
    fs.writeFileSync(path.join(branchesPath, 'main'), initialCommitHash);

    // Create a new branch
    branchManager.createBranch('test-branch');

    // Check branch reference exists
    const branchPath = path.join(tempRepoPath, '.track.it', 'refs', 'test-branch');
    expect(fs.existsSync(branchPath)).toBe(true);
  });

  it('should not create a branch with invalid name', () => {
    expect(() => {
      branchManager.createBranch('invalid branch name!');
    }).toThrow('Invalid branch name');
  });

  it('should not create an existing branch', () => {
    // First create a branch
    branchManager.createBranch('test-branch');

    // Try to create the same branch again
    expect(() => {
      branchManager.createBranch('test-branch');
    }).toThrow('Branch \'test-branch\' already exists');
  });

  it('should checkout a branch', () => {
    // First, create a branch
    branchManager.createBranch('test-branch');

    // Checkout the branch
    branchManager.checkout('test-branch');

    // Check HEAD file
    const headPath = path.join(tempRepoPath, '.track.it', 'HEAD');
    const headContent = fs.readFileSync(headPath, 'utf-8').trim();
    
    expect(headContent).toBe('ref: refs/heads/test-branch');
  });

  it('should not checkout a non-existing branch', () => {
    expect(() => {
      branchManager.checkout('non-existent-branch');
    }).toThrow('Branch \'non-existent-branch\' does not exist');
  });

  it('should list branches', () => {
    // Create some branches
    branchManager.createBranch('feature1');
    branchManager.createBranch('feature2');

    // List branches
    const branches = branchManager.listBranches();
    
    expect(branches).toContain('heads');
    expect(branches).toContain('feature1');
    expect(branches).toContain('feature2');
  });

  it('should get current branch', () => {
    // Default should be main
    expect(branchManager.getCurrentBranch()).toBe('main');

    // Create and checkout a new branch
    branchManager.createBranch('feature-branch');
    branchManager.checkout('feature-branch');

    // Check current branch
    expect(branchManager.getCurrentBranch()).toBe('feature-branch');
  });
});