# Architecture of Track-It

## Overview

`Track-It` is a lightweight version control system designed to mimic core Git
functionalities. It is implemented in TypeScript for its strong typing system,
which improves maintainability and scalability. The architecture is modular,
focusing on command-based operations and file handling.

## Architecture

### 1. **Commands Layer (`commands/`)**

- Contains command files that implement operations like `init`, `commit`,
  `clone`, `branch`, `merge`, etc.
- Each command is handled by a corresponding `.ts` file (e.g., `commit.ts`,
  `merge.ts`).
- These commands interact with the `index.ts` file for overall workflow
  execution.

### 2. **Index Layer (`index.ts`)**

- Acts as the entry point to handle command execution based on user input.
- Calls the appropriate command logic from the `commands/` directory and
  orchestrates the workflow.

### 3. **Utils Layer (`utils/`)**

- Provides utility functions like file system management and type definitions.
- Includes files like `file-system.ts` for handling file operations and
  `types.ts` for type declarations.

### 4. **Test Layer (`tests/`)**

- Implements tests for commands and utility functions to ensure the system works
  as expected.
- This layer supports the Test-Driven Development (TDD) approach, ensuring
  system reliability.

### 5. **File System Layer**

- The `.trackit` directory holds all repository-related files, such as commit
  histories, configuration data, and staging information.
- File operations are abstracted in the `utils/` layer for reuse across
  different components.

## Key Components and Workflows

### **Repository Initialization (`init`)**

- Initializes a `.trackit` folder containing metadata and configuration files.

### **File Staging (`stage`)**

- Tracks files to be committed by managing changes in an index file.

### **Commit Handling (`commit`)**

- Saves file snapshots and commits them with metadata (e.g., message,
  timestamp).

### **Branch Management (`branch`)**

- Supports branch creation and switching, tracking branch pointers.

### **Merging Changes (`merge`)**

- Merges changes from one branch to another, resolving conflicts.

### **Logging (`log`)**

- Displays commit history, including metadata and changes.

### **Difference Checking (`diff`)**

- Highlights differences between file versions using the `diff-match-patch`
  library.

## High-Level Diagram

```
+-----------------------+
|       Commands        |
|    (init, commit, etc) |
+-----------------------+
          ↓
+-----------------------+
|        Index          |
|   (index.ts entry)    |
+-----------------------+
          ↓
+-----------------------+
|        Utils          |
| (file-system, types)  |
+-----------------------+
          ↓
+-----------------------+
|      File System      |
|   (.trackit directory)|
+-----------------------+
```

## Technology Choices

1. **TypeScript**: For static typing, improved developer productivity, and
   maintainability.
2. **fs-extra**: A file system utility library for easier handling of file
   operations.
3. **diff-match-patch**: Efficient diff algorithm for file comparison and
   conflict resolution.
4. **Jest**: For test automation and ensuring the correctness of the system.

---

## How It All Ties Together

1. **Modularity**: Each functionality is modularized into commands, core logic,
   utilities, and tests. This makes it easy to scale the system with new
   features or commands.
2. **Workflow**: Commands interact with the `index.ts` file, and utility
   functions are used for file operations, ensuring minimal code repetition and
   high reusability.
3. **File Handling**: All repository data is stored in the `.trackit` folder,
   which is managed by utility functions to maintain the integrity of the
   repository state.
4. **Extendability**: Adding a new feature like `revert` or `reset` can be
   easily done by extending the `commands/` directory without major changes to
   the core logic.

By following this structured approach, `Track-It` provides a scalable and
modular system that can be easily maintained and extended in the future.
