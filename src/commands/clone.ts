import * as fs from 'fs-extra';
import * as path from 'path';

class CloneManager {
  private trackItPath: string;

  constructor() {
    this.trackItPath = path.resolve(process.cwd(), ".track-it");
  }

  /**
   * Clone the repository to a new location
   * @param destinationPath Path where repository should be cloned
   */
  public clone(destinationPath: string): void {
    // Validate source repository exists
    if (!fs.existsSync(this.trackItPath)) {
      throw new Error('No track-it repository found in the current directory');
    }

    // Ensure destination path is valid and empty
    if (fs.existsSync(destinationPath)) {
      const files = fs.readdirSync(destinationPath);
      if (files.length > 0) {
        throw new Error('Destination directory must be empty');
      }
    } else {
      fs.ensureDirSync(destinationPath);
    }

    // Copy .track-it directory
    const destinationTrackItPath = path.join(destinationPath, ".track-it");
    fs.copySync(this.trackItPath, destinationTrackItPath);

    console.log(`Repository cloned to: ${destinationPath}`);
  }
}

/**
 * CLI Command for cloning repository
 * @param destinationPath Path to clone repository
 */
export function cloneCommand(destinationPath: string): void {
  try {
    if (!destinationPath) {
      console.error('Destination path is required');
      process.exit(1);
    }

    const cloneManager = new CloneManager();
    cloneManager.clone(path.resolve(destinationPath));
  } catch (error) {
    console.error('Clone failed:', error);
    process.exit(1);
  }
}

export default CloneManager;
