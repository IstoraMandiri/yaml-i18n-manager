#!/usr/bin/env node
import yargs from 'yargs';
import { defaultConfig, initConfig } from './config';
import commands from './commands';

function requireLocale(y: any) {
  y.positional('locale', {
    describe: 'Target language code (e.g. ja)',
    type: 'string',
  });
}

const argv: any = yargs
  .usage('Usage: $0 <command> [options]')
  .version('v')
  .alias('v', 'version')
  .help('h')
  .alias('h', 'help')
  .options({
    c: {
      alias: 'config',
      type: 'string',
      describe: 'Config file',
      default: `${defaultConfig.managementDir}/config.yaml`,
    },
  })
  .command('init', 'Generate Config File')
  .command('generate <locale>', 'Auto-translate content', requireLocale)
  .command('export <locale>', 'Export CSV for a locale', requireLocale)
  .command('import <csv>', 'Import CSV translations', (y: any) => {
    y.positional('csv', {
      describe: 'Relative CSV file path',
      type: 'string',
    });
  })
  .demandCommand(1, 'Please enter a command').argv;

(async () => {
  const config = await initConfig(argv);
  if (!config) {
    return;
  }
  const [command] = argv._;
  await commands[command](argv, config);
})();
