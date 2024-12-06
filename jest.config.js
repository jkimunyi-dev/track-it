module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	clearMocks: true,
	resetMocks: true,
	restoreMocks: true,
	collectCoverageFrom: [
	  'src/**/*.ts',
	  '!src/**/*.d.ts'
	],
	coverageDirectory: 'coverage',
	testMatch: [
	  '**/__tests__/**/*.ts',
	  '**/?(*.)+(spec|test).ts'
	],
	moduleFileExtensions: [
	  'ts',
	  'tsx',
	  'js',
	  'jsx',
	  'json',
	  'node'
	],
	transform: {
	  '^.+\\.tsx?$': 'ts-jest'
	}
  };