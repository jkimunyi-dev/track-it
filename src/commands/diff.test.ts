import * as fs from 'fs-extra';
import * as path from 'path';
import DiffManager from './diff';
import CommitManager from './commit';

describe('DiffManager', () => {
  let diffManager: DiffManager;
  let testDir: string;

  beforeEach(() => {
    // Create a temporary test directory
    testDir = fs.mkdtempSync(path.join(process.cwd(), 'test-'));
    
    // Mock the .track-it path to use the test directory
    jest.spyOn(path, 'resolve').mockReturnValue(path.join(testDir, '.track-it'));
    
    // Create necessary directories
    fs.mkdirSync(path.join(testDir, '.track-it', 'objects'), { recursive: true });
    
    // Initialize DiffManager
    diffManager = new DiffManager();
  });

  afterEach(() => {
    // Clean up temporary directory
    fs.removeSync(testDir);
    jest.restoreAllMocks();
  });

  describe('compareFiles', () => {
    it('should compare two files and return line differences', () => {
      // Prepare test files in the objects directory
      const objectsPath = path.join(testDir, '.track-it', 'objects');
      const file1Hash = 'file1-hash';
      const file2Hash = 'file2-hash';
      
      fs.writeFileSync(path.join(objectsPath, file1Hash), 'Hello\nWorld\n');
      fs.writeFileSync(path.join(objectsPath, file2Hash), 'Hello\nChanged World\n');

      // Alternative approach to mocking the private method
      const originalMethod = (diffManager as any).readFileContentByHash;
      (diffManager as any).readFileContentByHash = jest.fn((hash: string) => {
        return fs.readFileSync(path.join(objectsPath, hash), 'utf-8');
      });

      // Perform comparison
      const differences = diffManager.compareFiles(file1Hash, file2Hash);

      // Verify differences
      expect(differences).toEqual([
        '  Hello',
        '- World',
        '+ Changed World'
      ]);

      // Restore the original method
      (diffManager as any).readFileContentByHash = originalMethod;
    });

    it('should throw error for non-existent file', () => {
      expect(() => {
        diffManager.compareFiles('non-existent-hash1', 'non-existent-hash2');
      }).toThrow('File with hash non-existent-hash1 not found');
    });
  });


  describe('diffCommits', () => {
    it('should compare two commits and return differences', () => {
      // Mock CommitManager methods
      const mockCommitManager = {
        readCommitObject: jest.fn()
      };
      
      // Spy on commitManager to use mock
      jest.spyOn(diffManager as any, 'commitManager').mockReturnValue(mockCommitManager);

      // Prepare mock commit objects
      const commit1 = {
        files: [
          { path: 'file1.txt', hash: 'hash1' },
          { path: 'file2.txt', hash: 'hash2' }
        ]
      };
      const commit2 = {
        files: [
          { path: 'file1.txt', hash: 'hash3' },
          { path: 'file3.txt', hash: 'hash4' }
        ]
      };

      mockCommitManager.readCommitObject
        .mockReturnValueOnce(commit1)
        .mockReturnValueOnce(commit2);

      // Spy on compareFiles to return mock differences
      const compareSpy = jest.spyOn(diffManager, 'compareFiles')
        .mockReturnValue(['+ Some differences']);

      // Perform diff
      const result = diffManager.diffCommits('commit1', 'commit2');

      // Verify result
      expect(result).toEqual([
        {
          filePath: 'file1.txt',
          differences: ['+ Some differences']
        },
        {
          filePath: 'file3.txt',
          differences: ['+ New file: file3.txt']
        }
      ]);

      compareSpy.mockRestore();
    });
  });
});