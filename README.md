# Track-It: A Distributed Source Control System

Track-It is a lightweight, distributed source control system inspired by Git.
Designed for developers who want a simple yet powerful tool to manage their
projects, Track-It provides essential functionalities like staging files,
committing changes, viewing commit history, and more—all implemented from
scratch.

---

## Features

### Core Functionalities

- **Initialize a Repository**: Create a new repository with a `.trackit`
  directory to store version history.
- **Staging Files**: Add files to the staging area for tracking changes
  (`trackit add`).
- **Committing Changes**: Save staged changes to the repository with descriptive
  commit messages (`trackit commit`).
- **Viewing Commit History**: List all commits in chronological order with
  metadata (`trackit log`).
- **Branch Management**: Create and switch between branches (`trackit branch`).
- **File Differences**: Compare changes between branches or commits
  (`trackit diff`).
- **Conflict Detection**: Detect conflicting changes during merges.
- **Cloning Repositories**: Clone repositories to another directory on disk.
- **Ignore Files**: Use `.trackignore` files to exclude specific files or
  directories from tracking.

---

## Project Structure

```bash
Track-It/
│
├── src/                # Contains all your source code
│   ├── main.go         # Main application entry point
│   ├── cli.go          # CLI functionalities
│   ├── commands/       # Specific command implementations
├── tests/              # Test cases
│   ├── unit/           # Unit tests
│   ├── integration/    # Integration tests
├── docs/               # Documentation files
│   ├── README.md       # Main documentation
│   ├── implementation.md # Step-by-step implementation details
│   ├── ARCHITECTURE.md  # Design and architecture decisions
├── .gitignore
├── LICENSE
└── go.mod              # Go module dependencies
```

---

## Installation

1. Clone the repository from GitHub:
   ```bash
   git clone https://github.com/yourusername/track-it.git
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

4. Run the tool:
   ```bash
   npm start
   ```

---

## Usage

### Initialize a Repository

```bash
trackit init
```

Creates a new `.trackit` directory in the current folder.

### Stage Files

```bash
trackit add file1.txt file2.txt
```

Stages the specified files for tracking.

### Commit Changes

```bash
trackit commit -m "Your commit message"
```

Records the staged changes with a commit message.

### View Commit History

```bash
trackit log
```

Displays a list of all commits.

### Create a Branch

```bash
trackit branch new-branch-name
```

Creates a new branch.

### Merge Branches

```bash
trackit merge branch-to-merge
```

Merges the specified branch into the current branch.

---

## Highlights of Thought Process

1. **Modular Design**: The project is divided into clear modules for
   initialization, staging, committing, and more.
2. **Incremental Development**: Each feature was built and tested in isolation
   before integration.
3. **Error Handling**: Robust error handling ensures smooth operation and
   meaningful error messages for users.
4. **Documentation First**: Emphasis on clear documentation to make the tool
   easy to use and extend.

---

## License

This project is licensed under the ISC License.
