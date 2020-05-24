import yaml from 'yaml';
import { promises } from 'fs';
import { resolve } from 'path';
import { log } from './utils';

const { writeFile, readFile, mkdir } = promises;

export const defaultConfig = {
  defaultLocale: 'en',
  contentDir: 'content',
  yamlDir: '_i18n',
  csvDir: 'csv',
  filterKeys: ['link', 'className', 'date', 'tags'],
  filterMarkdown: [],
};

export async function initConfig(argv: any) {
  const [command] = argv._;
  const location = resolve(process.env.PWD, argv.config);
  if (command === 'init') {
    try {
      const path = location.split('/').slice(0, -1).join('/');
      await mkdir(path, { recursive: true });
      await writeFile(location, yaml.stringify(defaultConfig));
      log(`Wrote config to ${argv.config}`, defaultConfig);
      return null;
    } catch (e) {
      throw e;
    }
  }
  let configData, config;
  try {
    configData = await readFile(location, 'utf8');
  } catch (e) {
    log(location);
    log(
      'Config file not found. Pass a config file with `--config` or initialize with `init` command.',
    );
    return null;
  }
  try {
    config = yaml.parse(configData);
  } catch (e) {
    log(`Could not parse the config file at ${location}`);
    return null;
  }
  return config;
}
