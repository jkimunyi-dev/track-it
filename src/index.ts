import { program } from "commander";
import { initRepository } from './commands/init';

program.version("0.1.0").description("TrackIt - A Minimal git implementation in typescript")

program
  .command('init')
  .description('Initialize a new repository')
  .action(initRepository);

program.parse(process.argv);
