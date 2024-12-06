import * as fs from 'fs-extra';
import * as path from 'path';
import MergeManager from './merge';

describe('MergeManager', () => {
  let mergeManager: MergeManager;
  let testDir: string;
  let trackItPath: string;


  beforeEach(() => {
    // Create a temporary test directory
    testDir = fs.mkdtempSync(path.join(process.cwd(), 'test-'));
    
    // Create .trackit directory structure
    trackItPath = path.join(testDir, '.trackit');
    fs.mkdirSync(path.join(trackItPath, 'refs', 'heads'), { recursive: true });
    fs.mkdirSync(path.join(trackItPath, 'objects'), { recursive: true });
    
    // Create HEAD file
    fs.writeFileSync(
      path.join(trackItPath, 'HEAD'), 
      'refs/heads/main'
    );

    // Initialize MergeManager with the test directory
    mergeManager = new MergeManager(testDir);
  });

  afterEach(() => {
    // Clean up temporary directory
    fs.removeSync(testDir);
    jest.restoreAllMocks();
  });


  describe('findCommonAncestor', () => {
    it('should find common ancestor between two branches', () => {
      // Prepare mock branch commits
      const objectsPath = path.join(trackItPath, 'objects');
      const branch1CommitHash = 'commit1';
      const branch2CommitHash = 'commit3';
      const commonAncestorHash = 'commit2';

      // Create mock commit objects
      const commit1 = { parent: commonAncestorHash };
      const commit2 = { parent: undefined };
      const commit3 = { parent: commonAncestorHash };

      // Write commit objects to test directory
      fs.writeFileSync(
        path.join(objectsPath, branch1CommitHash), 
        JSON.stringify(commit1)
      );
      fs.writeFileSync(
        path.join(objectsPath, branch2CommitHash), 
        JSON.stringify(commit3)
      );
      fs.writeFileSync(
        path.join(objectsPath, commonAncestorHash), 
        JSON.stringify(commit2)
      );

      // Prepare branch references
      const refsPath = path.join(trackItPath, 'refs', 'heads');
      fs.writeFileSync(path.join(refsPath, 'branch1'), branch1CommitHash);
      fs.writeFileSync(path.join(refsPath, 'branch2'), branch2CommitHash);

      // Use reflection to call private method
      const findCommonAncestor = (mergeManager as any).findCommonAncestor;
      const result = findCommonAncestor.call(mergeManager, 'branch1', 'branch2');

      expect(result).toBe(commonAncestorHash);
    });

    it('should return undefined if no common ancestor exists', () => {
      // Use reflection to call private method
      const findCommonAncestor = (mergeManager as any).findCommonAncestor;
      const result = findCommonAncestor.call(mergeManager, 'nonexistent1', 'nonexistent2');

      expect(result).toBeUndefined();
    });

  });

  describe('detectMergeConflicts', () => {
    it('should detect conflicts when same file has different content', () => {
      // Prepare mock commit objects
      const objectsPath = path.join(testDir, '.trackit', 'objects');
      
      // Create file hashes
      const file1HashBranch1 = 'hash1';
      const file1HashBranch2 = 'hash2';

      // Write file contents
      fs.writeFileSync(
        path.join(objectsPath, file1HashBranch1), 
        'Content from branch 1'
      );
      fs.writeFileSync(
        path.join(objectsPath, file1HashBranch2), 
        'Content from branch 2'
      );

      // Create mock commit objects
      const currentBranchCommit = {
        files: [{ path: 'file1.txt', hash: file1HashBranch1 }]
      };
      const mergeBranchCommit = {
        files: [{ path: 'file1.txt', hash: file1HashBranch2 }]
      };

      // Use reflection to call private method
      const detectMergeConflicts = (mergeManager as any).detectMergeConflicts;
      const conflicts = detectMergeConflicts.call(
        mergeManager, 
        currentBranchCommit, 
        mergeBranchCommit
      );

      expect(conflicts).toHaveLength(1);
      expect(conflicts[0]).toEqual({
        filePath: 'file1.txt',
        currentBranchContent: 'Content from branch 1',
        mergeBranchContent: 'Content from branch 2'
      });
    });
  });

  describe('merge', () => {
    it('should throw error when merging into a branch with no commits', () => {
      // Prepare an empty branch
      const refsPath = path.join(testDir, '.trackit', 'refs', 'heads');
      fs.writeFileSync(path.join(refsPath, 'fromBranch'), 'some-commit-hash');
      
      // Remove any commits from main branch
      const mainBranchPath = path.join(refsPath, 'main');
      if (fs.existsSync(mainBranchPath)) {
        fs.unlinkSync(mainBranchPath);
      }

      expect(() => {
        mergeManager.merge('fromBranch');
      }).toThrow('Cannot merge into a branch with no commits');
    });
  });
});