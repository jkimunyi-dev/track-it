import * as fs from 'fs-extra';
import * as path from 'path';
import DiffManager from './diff';
import CommitManager from './commit';
import { CommitObject as ImportedCommitObject } from '../utils/types';

// Local type definition that matches the imported type
interface CommitObject {
  files: { path: string; hash: string }[];
  timestamp: number;
  message: string;
}

describe('DiffManager', () => {
  let diffManager: DiffManager;
  let testDir: string;
  let mockCommitManager: jest.Mocked<CommitManager>;

  beforeEach(() => {
    // Create a temporary test directory
    testDir = fs.mkdtempSync(path.join(process.cwd(), 'test-'));
    
    // Create necessary directories
    fs.mkdirSync(path.join(testDir, '.track-it', 'objects'), { recursive: true });
    
    // Create a mock CommitManager
    mockCommitManager = {
      readCommitObject: jest.fn()
    } as any;

    // Initialize DiffManager with test path resolver and mock CommitManager
    const createTestPathResolver = (testDir: string) => {
      return (base: string, ...paths: string[]) => {
        if (base === process.cwd() && paths[0] === '.track-it') {
          return path.join(testDir, '.track-it');
        }
        return path.resolve(base, ...paths);
      };
    };

    // Create DiffManager with custom constructor to inject mock CommitManager
    class TestDiffManager extends DiffManager {
      constructor(pathResolver = path.resolve) {
        super(pathResolver);
        // @ts-ignore
        this.commitManager = mockCommitManager;
      }
    }

    diffManager = new TestDiffManager(createTestPathResolver(testDir));
  });

  afterEach(() => {
    // Clean up temporary directory
    fs.removeSync(testDir);
    jest.restoreAllMocks();
  });

  describe('diffCommits', () => {
    it('should compare two commits and return differences', () => {
      // Prepare mock commit objects with timestamp as number
      const commit1: CommitObject = {
        files: [
          { path: 'file1.txt', hash: 'hash1' },
          { path: 'file2.txt', hash: 'hash2' }
        ],
        timestamp: new Date('2023-01-01').getTime(), // Use timestamp number
        message: 'First commit'
      };
      const commit2: CommitObject = {
        files: [
          { path: 'file1.txt', hash: 'hash3' },
          { path: 'file3.txt', hash: 'hash4' }
        ],
        timestamp: new Date('2023-01-02').getTime(), // Use timestamp number
        message: 'Second commit'
      };

      // Prepare object directory for mocked file hashes
      const objectsPath = path.join(testDir, '.track-it', 'objects');
      fs.writeFileSync(path.join(objectsPath, 'hash1'), 'Original content');
      fs.writeFileSync(path.join(objectsPath, 'hash3'), 'Modified content');

      mockCommitManager.readCommitObject
        .mockReturnValueOnce(commit1)
        .mockReturnValueOnce(commit2);

      // Perform diff
      const result = diffManager.diffCommits('commit1', 'commit2');

      // Verify result
      expect(result).toEqual(expect.arrayContaining([
        expect.objectContaining({
          filePath: 'file1.txt',
          differences: expect.any(Array)
        }),
        expect.objectContaining({
          filePath: 'file3.txt',
          differences: ['+ New file: file3.txt']
        })
      ]));
    });
  });
});