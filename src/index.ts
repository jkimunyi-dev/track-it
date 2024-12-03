import { program } from "commander";
import { initRepository } from './commands/init';
import { stageCommand } from "./commands/stage";

program.version("0.1.0").description("TrackIt - A Minimal git implementation in typescript")

program
  .command('init')
  .description('Initialize a new repository')
  .action(initRepository);

program
	.command("stage <files ...>")
	.description("Stage files for commit")
	.action(stageCommand)

program.parse(process.argv);
