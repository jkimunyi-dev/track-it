import * as fs from 'fs-extra';
import * as path from 'path';
import { stageCommand } from './stage';

describe('Staging Files', () => {
  let originalCwd: string;
  let testRepoDir: string;
  let testFilePath: string;

  beforeEach(() => {
    // Save current working directory
    originalCwd = process.cwd();

    // Create temporary test repository
    testRepoDir = path.join(process.cwd(), 'test-track-it-repo');
    fs.mkdirSync(testRepoDir, { recursive: true });

    // Change to test repository
    process.chdir(testRepoDir);

    // Initialize repository
    fs.mkdirSync('.track-it', { recursive: true });
    fs.mkdirSync('.track-it/objects', { recursive: true });

    // Create a test file
    testFilePath = path.join(testRepoDir, 'test-file.txt');
    fs.writeFileSync(testFilePath, 'Test content');
  });

  afterEach(() => {
    // Restore original working directory
    process.chdir(originalCwd);

    // Clean up test repository
    fs.removeSync(testRepoDir);
  });

  test('should stage a single file', () => {
    // Stage the test file
    stageCommand([testFilePath]);

    // Check index file exists
    const indexPath = path.join(testRepoDir, '.track-it', 'index');
    expect(fs.existsSync(indexPath)).toBe(true);

    // Read and parse index
    const indexContent = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
    expect(indexContent.length).toBe(1);
    expect(indexContent[0].path).toBe(testFilePath);
  });

  test('should save file blob in objects directory', () => {
    // Stage the test file
    stageCommand([testFilePath]);

    // Check objects directory for blob
    const objectsDir = path.join(testRepoDir, '.track-it', 'objects');
    const files = fs.readdirSync(objectsDir);

    expect(files.length).toBe(1);
    expect(files[0]).toMatch(/^[a-f0-9]{64}$/); // SHA-256 hash format
  });
});