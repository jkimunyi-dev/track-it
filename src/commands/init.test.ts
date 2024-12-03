import * as fs from 'fs-extra';
import * as path from 'path';
import { initRepository } from './init';

// Utility to create a temporary test directory
function createTempDir(): string {
  const tempDir = path.join(process.cwd(), 'test-temp-repo');
  fs.mkdirSync(tempDir, { recursive: true });
  return tempDir;
}

describe('Repository Initialization', () => {
  let originalCwd: string;
  let testRepoDir: string;

  beforeEach(() => {
    // Save the current working directory
    originalCwd = process.cwd();
    
    // Create a temporary test directory
    testRepoDir = createTempDir();
    
    // Change to the temporary directory
    process.chdir(testRepoDir);
  });

  afterEach(() => {
    // Restore the original working directory
    process.chdir(originalCwd);
    
    // Clean up the test directory
    fs.removeSync(testRepoDir);
  });

  test('should create .track-it directory', () => {
    // Run repository initialization
    initRepository();

    // Check if .track-it directory exists
    const trackItPath = path.join(testRepoDir, '.track-it');
    expect(fs.existsSync(trackItPath)).toBe(true);
  });

  test('should create necessary subdirectories', () => {
    initRepository();

    const expectedSubdirs = [
      '.track-it/objects',
      '.track-it/refs'
    ];

    expectedSubdirs.forEach(subdir => {
      const fullPath = path.join(testRepoDir, subdir);
      expect(fs.existsSync(fullPath)).toBe(true);
    });
  });

  test('should create HEAD file with correct content', () => {
    initRepository();

    const headFilePath = path.join(testRepoDir, '.track-it/HEAD');
    expect(fs.existsSync(headFilePath)).toBe(true);

    const headContent = fs.readFileSync(headFilePath, 'utf-8');
    expect(headContent.trim()).toBe('ref: refs/heads/main');
  });

  test('should create .track-itignore file', () => {
    initRepository();

    const ignoreFilePath = path.join(testRepoDir, '.track-itignore');
    expect(fs.existsSync(ignoreFilePath)).toBe(true);
  });
});