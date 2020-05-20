import { resolve } from 'path';
import fs from 'fs-extra';
import commands from '../src/commands';
import rimraf from 'rimraf';

import { defaultConfig } from '../src/config';
import scan from './util/scan';

const contentSrc = './test/data/content-input';

const managementDir = './test/data/test-management';
const contentDir = './test/data/test-content';

const config = { ...defaultConfig, managementDir, contentDir };

describe('commands', () => {
  beforeEach(async () => {
    rimraf.sync(contentDir);
    rimraf.sync(managementDir);
    await fs.mkdir(managementDir);
    await fs.copy(contentSrc, contentDir);
  });
  afterEach(() => {
    rimraf.sync(contentDir);
    rimraf.sync(managementDir);
  });
  describe('export', () => {
    it('exports', async () => {
      await commands.export({ locale: 'ja' }, config);
      expect(await scan(managementDir)).toMatchSnapshot();
    });
  });
  describe('generate', () => {
    it('generates', async () => {
      await commands.generate({ locale: 'ja' }, config);
      expect(await scan(contentDir)).toMatchSnapshot();
    });
  });
  describe('import', () => {
    const csv = resolve(__dirname, './data/misc/import.csv');
    it('imports', async () => {
      await commands.import({ csv }, config);
      expect(await scan(contentDir)).toMatchSnapshot();
    });
    it('merges correctly', async () => {
      await commands.import({ csv }, { ...config, config });
      expect(await scan(contentDir)).toMatchSnapshot();
    });
  });
});
