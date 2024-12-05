import * as fs from 'fs-extra';
import * as path from 'path';
import IgnoreManager from './ignore';

describe('IgnoreManager', () => {
  let ignoreManager: IgnoreManager;
  let testDir: string;
  let ignorePath: string;

  beforeEach(() => {
    // Create a temporary test directory
    testDir = fs.mkdtempSync(path.join(process.cwd(), 'test-'));
    
    // Create .track-itignore file
    ignorePath = path.join(testDir, '.track-itignore');
    
    // Spy on process.cwd to return test directory
    jest.spyOn(process, 'cwd').mockReturnValue(testDir);
    
    // Initialize IgnoreManager
    ignoreManager = new IgnoreManager(testDir);
  });

  afterEach(() => {
    // Clean up temporary directory
    fs.removeSync(testDir);
    jest.restoreAllMocks();
  });

  describe('loadIgnorePatterns', () => {
    it('should load ignore patterns from .track-itignore', () => {
      // Write test ignore patterns
      fs.writeFileSync(ignorePath, 'node_modules\n*.log\n# Comment\n.git\n');
      
      // Reinitialize IgnoreManager to reload patterns
      ignoreManager = new IgnoreManager(testDir);
      
      const patterns = ignoreManager.getIgnorePatterns();
      
      expect(patterns).toEqual(['node_modules', '*.log', '.git']);
    });

    it('should return empty array if .track-itignore does not exist', () => {
      const patterns = ignoreManager.getIgnorePatterns();
      
      expect(patterns).toEqual([]);
    });
  });

  describe('isFileIgnored', () => {
    beforeEach(() => {
      // Write test ignore patterns
      fs.writeFileSync(ignorePath, 'node_modules\n*.log\n.git\n');
      
      // Reinitialize IgnoreManager to reload patterns
      ignoreManager = new IgnoreManager(testDir);
    });

    it('should ignore files matching patterns', () => {
      expect(ignoreManager.isFileIgnored(path.join(testDir, 'node_modules/package.json'))).toBe(true);
      expect(ignoreManager.isFileIgnored(path.join(testDir, 'app.log'))).toBe(true);
      expect(ignoreManager.isFileIgnored(path.join(testDir, '.git/config'))).toBe(true);
    });

    it('should not ignore files not matching patterns', () => {
      expect(ignoreManager.isFileIgnored(path.join(testDir, 'src/app.js'))).toBe(false);
    });
  });

  describe('filterIgnoredFiles', () => {
    beforeEach(() => {
      // Write test ignore patterns
      fs.writeFileSync(ignorePath, 'node_modules\n*.log\n.git\n');
      
      // Reinitialize IgnoreManager to reload patterns
      ignoreManager = new IgnoreManager(testDir);
    });

    it('should filter out ignored files', () => {
      const testFiles = [
        path.join(testDir, 'src/app.js'),
        path.join(testDir, 'node_modules/package.json'),
        path.join(testDir, 'app.log')
      ];

      const filteredFiles = ignoreManager.filterIgnoredFiles(testFiles);
      
      expect(filteredFiles).toEqual([path.join(testDir, 'src/app.js')]);
    });
  });

  describe('addIgnorePatterns', () => {
    it('should add new ignore patterns', () => {
      // Add new patterns
      ignoreManager.addIgnorePatterns(['dist', '*.tmp']);
      
      // Read the ignore file
      const content = fs.readFileSync(ignorePath, 'utf-8');
      
      expect(content).toContain('dist\n');
      expect(content).toContain('*.tmp\n');
    });

    it('should not add duplicate patterns', () => {
      // First add
      ignoreManager.addIgnorePatterns(['dist', '*.tmp']);
      
      // Second add with some duplicate patterns
      ignoreManager.addIgnorePatterns(['dist', 'logs']);
      
      // Read the ignore file
      const content = fs.readFileSync(ignorePath, 'utf-8');
      
      const patterns = content.split('\n').filter(line => line.trim());
      expect(patterns).toEqual(['dist', '*.tmp', 'logs']);
    });
  });
});