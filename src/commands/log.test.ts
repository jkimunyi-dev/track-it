import * as fs from 'fs-extra';
import * as path from 'path';
import LogManager, {logCommand} from './log'; // Adjust import path as needed

describe('LogManager', () => {
  let logManager: LogManager;
  let testDir: string;
  let trackItPath: string;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    // Create a temporary test directory
    testDir = fs.mkdtempSync(path.join(process.cwd(), 'test-'));
    
    // Create .track-it directory structure
    trackItPath = path.join(testDir, '.track-it');
    fs.mkdirSync(path.join(trackItPath, 'refs', 'heads'), { recursive: true });
    fs.mkdirSync(path.join(trackItPath, 'objects'), { recursive: true });
    
    // Create HEAD file
    fs.writeFileSync(
      path.join(trackItPath, 'HEAD'), 
      'refs/heads/main'
    );

    // Spy on console.log
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    // Mock process.cwd to return test directory
    jest.spyOn(process, 'cwd').mockReturnValue(testDir);

    // Initialize LogManager
    logManager = new LogManager();
  });

  afterEach(() => {
    // Clean up temporary directory
    fs.removeSync(testDir);
    jest.restoreAllMocks();
  });

  describe('log method', () => {
    it('should display message when no commits exist', () => {
      // Simulate no commits by not creating a branch reference file
      
      (logManager as any).log();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        "No commits found in the current repository."
      );
    });

    it('should display commit history correctly', () => {
      // Prepare mock commits
      const objectsPath = path.join(trackItPath, 'objects');
      const refsPath = path.join(trackItPath, 'refs', 'heads');

      // Create mock commits
      const commit1Hash = 'commit1';
      const commit2Hash = 'commit2';

      const commit1: any = {
        timestamp: Date.now(),
        message: 'First commit',
        files: [
          { path: 'file1.txt', hash: 'hash1' },
          { path: 'file2.txt', hash: 'hash2' }
        ],
        parent: commit2Hash
      };

      const commit2: any = {
        timestamp: Date.now() - 1000,
        message: 'Second commit',
        files: [
          { path: 'file3.txt', hash: 'hash3' }
        ],
        parent: undefined
      };

      // Write commit objects
      fs.writeFileSync(
        path.join(objectsPath, commit1Hash), 
        JSON.stringify(commit1)
      );
      fs.writeFileSync(
        path.join(objectsPath, commit2Hash), 
        JSON.stringify(commit2)
      );

      // Create branch reference
      fs.writeFileSync(
        path.join(refsPath, 'main'), 
        commit1Hash
      );

      // Call log method
      (logManager as any).log();

      // Verify console output
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining(`commit ${commit1Hash}`));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('First commit'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Files changed: 2'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining(`commit ${commit2Hash}`));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Second commit'));
    });

    it('should limit commits when maxCommits is specified', () => {
      // Prepare mock commits
      const objectsPath = path.join(trackItPath, 'objects');
      const refsPath = path.join(trackItPath, 'refs', 'heads');

      // Create mock commits
      const commit1Hash = 'commit1';
      const commit2Hash = 'commit2';
      const commit3Hash = 'commit3';

      const commit1: any = {
        timestamp: Date.now(),
        message: 'First commit',
        files: [{ path: 'file1.txt', hash: 'hash1' }],
        parent: commit2Hash
      };

      const commit2: any = {
        timestamp: Date.now() - 1000,
        message: 'Second commit',
        files: [{ path: 'file2.txt', hash: 'hash2' }],
        parent: commit3Hash
      };

      const commit3: any = {
        timestamp: Date.now() - 2000,
        message: 'Third commit',
        files: [{ path: 'file3.txt', hash: 'hash3' }],
        parent: undefined
      };

      // Write commit objects
      fs.writeFileSync(
        path.join(objectsPath, commit1Hash), 
        JSON.stringify(commit1)
      );
      fs.writeFileSync(
        path.join(objectsPath, commit2Hash), 
        JSON.stringify(commit2)
      );
      fs.writeFileSync(
        path.join(objectsPath, commit3Hash), 
        JSON.stringify(commit3)
      );

      // Create branch reference
      fs.writeFileSync(
        path.join(refsPath, 'main'), 
        commit1Hash
      );

      // Call log method with maxCommits
      (logManager as any).log(2);

      // Verify console output
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining(`commit ${commit1Hash}`));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining(`commit ${commit2Hash}`));
      expect(consoleLogSpy).not.toHaveBeenCalledWith(expect.stringContaining(`commit ${commit3Hash}`));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('... and more commits'));
    });

    it('should throw error when commit is not found', () => {
      // Create branch reference to non-existent commit
      const refsPath = path.join(trackItPath, 'refs', 'heads');
      fs.writeFileSync(
        path.join(refsPath, 'main'), 
        'non-existent-commit'
      );

      // Expect an error to be thrown
      expect(() => (logManager as any).log()).toThrow('Commit non-existent-commit not found');
    });
  });

  describe('getCurrentBranch method', () => {
    it('should return main branch by default', () => {
      // Use default HEAD content
      const getCurrentBranch = (logManager as any).getCurrentBranch.bind(logManager);
      
      expect(getCurrentBranch()).toBe('main');
    });

    it('should return correct branch name', () => {
      // Write custom HEAD content
      fs.writeFileSync(
        path.join(trackItPath, 'HEAD'), 
        'refs/heads/feature-branch'
      );

      const getCurrentBranch = (logManager as any).getCurrentBranch.bind(logManager);
      
      expect(getCurrentBranch()).toBe('feature-branch');
    });
  });

  describe('logCommand', () => {
    it('should create LogManager and call log method', () => {
      // Spy on log method
      const logSpy = jest.spyOn(LogManager.prototype, 'log');

      // Call log command
      logCommand(2);

      // Verify log method was called
      expect(logSpy).toHaveBeenCalledWith(2);
    });

    it('should handle errors gracefully', () => {
      // Mock process.exit
      const processExitSpy = jest.spyOn(process, 'exit').mockImplementation();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
      // Force an error by creating LogManager with invalid path
      jest.spyOn(process, 'cwd').mockReturnValue('/invalid/path');
    
      // Call log command
      logCommand();
    
      // Verify error handling
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to display log:')
      );
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });
});