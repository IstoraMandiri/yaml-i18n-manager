import { resolve } from 'path';
import fs from 'fs-extra';
import commands from '../src/commands';
import rimraf from 'rimraf';

import { defaultConfig } from '../src/config';
import scan from './util/scan';

const contentSrc = './test/data/content-input';

const csvDir = './test/data/test-csv';
const contentDir = './test/data/test-content';

const config = { ...defaultConfig, csvDir, contentDir };

describe('commands', () => {
  beforeEach(async () => {
    rimraf.sync(contentDir);
    rimraf.sync(csvDir);
    await fs.mkdir(csvDir);
    await fs.copy(contentSrc, contentDir);
  });
  afterEach(() => {
    rimraf.sync(contentDir);
    rimraf.sync(csvDir);
  });
  describe('generate', () => {
    it('generates', async () => {
      await commands.generate({ locale: 'ja' }, config);
      expect(await scan(contentDir)).toMatchSnapshot();
    });
  });

  describe('export', () => {
    it('exports', async () => {
      await commands.export({ locale: 'ja' }, config);
      expect(await scan(csvDir)).toMatchSnapshot();
    });
  });
  describe('eject', () => {
    it('ejects', async () => {
      await commands.eject({ locale: 'ja' }, config);
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
