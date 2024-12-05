import IgnoreManager from './ignore';

export function ignoreCommand(patterns: string[]): void {
  try {
    const ignoreManager = new IgnoreManager();
    
    if (patterns.length === 0) {
      // If no patterns, list current ignores
      const currentPatterns = ignoreManager.getIgnorePatterns();
      console.log('Current ignore patterns:');
      currentPatterns.forEach(pattern => console.log(pattern));
      return;
    }

    // Add new ignore patterns
    ignoreManager.addIgnorePatterns(patterns);
  } catch (error) {
    console.error('Ignore command failed:', error);
    process.exit(1);
  }
}