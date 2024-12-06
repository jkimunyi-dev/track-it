# Track-It

## Project Overview

Track-It is a distributed source control system inspired by Git. It provides
essential functionalities for managing code repositories, including initializing
repositories, staging files, committing changes, and branching. The project
demonstrates core concepts of version control and is implemented entirely in
TypeScript.

## Features Implemented

- **Repository Initialization** (`init`): Create a new repository in the
  specified directory, storing metadata in a `.trackit` subdirectory.
- **Staging Files** (`stage`): Add files to the staging area in preparation for
  commits.
- **Committing Changes** (`commit`): Save changes to the repository's history.
- **Branching** (`branch`): Create and manage branches to support parallel
  development.
- **Merging** (`merge`): Combine changes from different branches and detect
  conflicts.
- **Viewing History** (`log`): View the commit history of a repository.
- **Diffing Changes** (`diff`): Compare changes between commits or branches.
- **Cloning Repositories** (`clone`): Create a copy of a repository.
- **Ignoring Files** (`ignore`): Specify patterns of files to exclude from
  version control.

## Directory Structure

```
src/
├── commands
│   ├── branch.ts          # Handles branch creation and management.
│   ├── branch.test.ts     # Unit tests for branch functionality.
│   ├── clone.ts           # Implements repository cloning.
│   ├── clone.test.ts      # Unit tests for clone functionality.
│   ├── commit.ts          # Manages committing changes.
│   ├── commit.test.ts     # Unit tests for commit functionality.
│   ├── diff.ts            # Handles diffing changes between states.
│   ├── diff.test.ts       # Unit tests for diff functionality.
│   ├── ignore.ts          # Implements file ignoring.
│   ├── ignore.test.ts     # Unit tests for ignore functionality.
│   ├── init.ts            # Repository initialization logic.
│   ├── init.test.ts       # Unit tests for repository initialization.
│   ├── log.ts             # Displays commit history.
│   ├── log.test.ts        # Unit tests for log functionality.
│   ├── merge.ts           # Handles branch merging.
│   ├── merge.test.ts      # Unit tests for merge functionality.
│   ├── stage.ts           # Stages files for commit.
│   ├── stage.test.ts      # Unit tests for stage functionality.
├── core
│   └── repository.ts      # Core logic for repository management.
├── utils
│   ├── file-system.ts     # Utilities for file system operations.
│   └── types.ts           # Shared type definitions.
├── index.ts               # Entry point of the application.
```

## Installation and Usage

### Prerequisites

- Node.js (v18 or higher)
- TypeScript (v5.7 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/track-it.git
   cd track-it
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the project:
   ```bash
   npm run build
   ```

### Usage

Initialize a repository:

```bash
npm start -- init <repository-path>
```

Stage a file for commit:

```bash
npm start -- stage <file-path>
```

Commit changes:

```bash
npm start -- commit -m "Your commit message"
```

View commit history:

```bash
npm start -- log
```

For additional commands and examples, see the
[instructions.md](./instructions.md) file.

## Highlights of My Thought Process

- **Modular Design**: The project is divided into `commands`, `core`, and
  `utils`, ensuring clean separation of concerns and maintainability.
- **Testing**: Unit tests are implemented for all critical functionalities using
  Jest, ensuring the correctness of the codebase.
- **Error Handling**: Comprehensive error handling is included to manage edge
  cases like invalid commands or missing repositories.
- **Scalability**: Designed to easily add more commands or features in the
  future.
- **Documentation**: Detailed inline comments and structured documentation
  provide clarity and ease of understanding.

## Future Improvements

- Implement networking for remote repository cloning and pushing.
- Add a graphical user interface (GUI) for enhanced usability.
- Incorporate rebase and conflict resolution features.

## License

This project is licensed under the ISC License.

---

### Need Help?

If you have questions or encounter issues, feel free to open an issue on the
repository or contact me at [your-email@example.com].
