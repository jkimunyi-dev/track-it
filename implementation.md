# Implementation Steps for Source Control System

This document outlines the steps to incrementally build a distributed source
control system similar to Git. Each step focuses on adding a specific feature or
functionality, building upon the previous ones.

---

## **1. Initialize a Repository**

**Objective:** Create a `.source-control` directory to store repository data.\
**Steps:**

- Create a CLI command `init` that initializes a new repository.
- The repository metadata should be stored in a dot-prefixed subdirectory, e.g.,
  `.source-control`.
- Create the necessary folder structure inside `.source-control`:
  - `objects/` for storing file blobs.
  - `refs/` for branches.
  - `HEAD` file to track the current branch.

---

## **2. Stage Files**

**Objective:** Implement a `stage` command to stage changes (like `git add`).\
**Steps:**

- Create a `stage` CLI command.
- Track staged files using an index file (e.g., `.source-control/index`).
- Compute a hash for each staged file (e.g., using SHA-256).
- Save file blobs in the `objects/` directory, using their hash as the filename.

---

## **3. Commit Changes**

**Objective:** Create a `commit` command to save the current state of staged
files.\
**Steps:**

- Create a `commit` CLI command.
- Store commit objects in the `objects/` directory.
- Each commit object should:
  - Reference the staged files' hashes.
  - Include metadata (e.g., author, timestamp, parent commit hash).
- Update the `refs/` directory to track the latest commit for the current
  branch.

---

## **4. View Commit History**

**Objective:** Implement a `log` command to display the commit history.\
**Steps:**

- Traverse the commit objects starting from the current branch's latest commit.
- Print each commit's hash and metadata (author, timestamp, message).

---

## **5. Create and Switch Branches**

**Objective:** Add support for branch creation and switching.\
**Steps:**

- Create a `branch` CLI command to create new branches.
- Update the `refs/` directory to store branch pointers.
- Create a `checkout` CLI command to switch between branches.
- Update the `HEAD` file to track the current branch.

---

## **6. Merge Branches**

**Objective:** Implement a `merge` command to combine changes from two
branches.\
**Steps:**

- Find the common ancestor of the two branches.
- Create a new commit with changes from both branches.
- Detect conflicting changes but do not resolve them.
- Mark conflicts in the output for manual resolution.

---

## **7. Perform Diffs**

**Objective:** Add a `diff` command to view differences between commits or
branches.\
**Steps:**

- Compare the content of files using their hashes.
- Display line-by-line differences for each file.

---

## **8. Clone Repository**

**Objective:** Implement a `clone` command to copy the repository to a new
location.\
**Steps:**

- Copy the `.source-control` directory to the specified location.
- Ensure all commit history and blobs are preserved.

---

## **9. Ignore Files**

**Objective:** Add support for ignoring files using a `.ignore` file.\
**Steps:**

- Check for a `.ignore` file in the repository root.
- Exclude matching files from staging and committing processes.

---

## **10. Finalize and Document**

**Objective:** Ensure the system is functional and provide usage instructions.\
**Steps:**

- Write a `README.md` with examples of commands and usage.
- Perform final testing to validate all features.

---

This step-by-step guide ensures that the source control system can be developed
incrementally while maintaining functionality at each stage.
