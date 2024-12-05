import { program } from "commander";
import { initRepository } from './commands/init';
import { stageCommand } from "./commands/stage";
import { commitCommand } from "./commands/commit";
import { logCommand } from "./commands/log";
import { branchCommand, checkoutCommand, branchListCommand } from "./commands/branch";
import { mergeCommand } from "./commands/merge";
import { diffCommand } from "./commands/diff";
import { cloneCommand } from "./commands/clone";
import IgnoreManager from "./commands/ignore";
import { ignoreCommand } from "./commands/ignoreFn";

program.version("0.1.0").description("TrackIt - A Minimal git implementation in typescript")

program
  .command('init')
  .description('Initialize a new repository')
  .action(initRepository);

program
	.command("stage <files ...>")
	.description("Stage files for commit")
	.action(stageCommand)

program
	.command("commit <message>")
	.description("Commit files")
	.action(commitCommand)

program
	.command("log")
	.description("View commit history")
	.action(logCommand)

program
	.command("branch <name>")
	.description("Create a new branch")
	.action(branchCommand)

program
	.command("checkout <branch>")
	.description("Swithch to a branch")
	.action(checkoutCommand)

program
	.command("branch-list")
	.description("List all branches")
	.action(branchListCommand)
program
	.command("merge <branch>")
	.description("Merge a branch into the current branch")
	.action(mergeCommand)
	
program
	.command("diff <hash1> <hash2>")
	.description("Compare files or commits")
	.action(diffCommand)
  
program
	.command("clone <destination>")
	.description("Clone repository to a new location")
	.action(cloneCommand)
program
	.command("ignore [patterns...]")
	.description("Manage .track-itignore file. Without arguments, list current ignore patterns. With arguments, add new ignore patterns.")
	.action(ignoreCommand)
  
  

program.parse(process.argv);
