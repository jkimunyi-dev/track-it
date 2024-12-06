import * as fs from 'fs-extra';
import * as path from 'path';
import CloneManager from './clone';

describe('CloneManager', () => {
  let cloneManager: CloneManager;
  let sourceDir: string;
  let destinationDir: string;

  beforeEach(() => {
    // Create source and destination temporary directories
    sourceDir = fs.mkdtempSync(path.join(process.cwd(), 'source-'));
    destinationDir = fs.mkdtempSync(path.join(process.cwd(), 'destination-'));

    // Create a mock .trackit directory in source
    const trackItPath = path.join(sourceDir, '.trackit');
    fs.mkdirSync(trackItPath, { recursive: true });
    
    // Add some dummy files to simulate a repository
    fs.writeFileSync(path.join(trackItPath, 'HEAD'), 'ref: refs/heads/main');
    fs.mkdirSync(path.join(trackItPath, 'refs', 'heads'), { recursive: true });
    fs.mkdirSync(path.join(trackItPath, 'objects'), { recursive: true });

    // Spy on process.cwd to return source directory
    jest.spyOn(process, 'cwd').mockReturnValue(sourceDir);

    // Initialize CloneManager
    cloneManager = new CloneManager();
  });

  afterEach(() => {
    // Clean up temporary directories
    fs.removeSync(sourceDir);
    fs.removeSync(destinationDir);
    jest.restoreAllMocks();
  });

  describe('clone', () => {
    it('should clone repository to an empty directory', () => {
      // Perform clone
      cloneManager.clone(destinationDir);

      // Verify destination directory contents
      const clonedTrackItPath = path.join(destinationDir, '.trackit');
      
      expect(fs.existsSync(clonedTrackItPath)).toBe(true);
      expect(fs.existsSync(path.join(clonedTrackItPath, 'HEAD'))).toBe(true);
      expect(fs.existsSync(path.join(clonedTrackItPath, 'refs', 'heads'))).toBe(true);
      expect(fs.existsSync(path.join(clonedTrackItPath, 'objects'))).toBe(true);
    });

    it('should throw error if source repository does not exist', () => {
      // Remove source .trackit directory
      fs.removeSync(path.join(sourceDir, '.trackit'));

      expect(() => {
        cloneManager.clone(destinationDir);
      }).toThrow('No trackit repository found in the current directory');
    });

    it('should throw error if destination directory is not empty', () => {
      // Add a file to destination directory
      fs.writeFileSync(path.join(destinationDir, 'somefile.txt'), 'content');

      expect(() => {
        cloneManager.clone(destinationDir);
      }).toThrow('Destination directory must be empty');
    });
  });
});