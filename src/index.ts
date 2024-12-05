import { program } from "commander";
import { initRepository } from './commands/init';
import { stageCommand } from "./commands/stage";
import { commitCommand } from "./commands/commit";
import { logCommand } from "./commands/log";
import { branchCommand, checkoutCommand, branchListCommand } from "./commands/branch";

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

program.parse(process.argv);
