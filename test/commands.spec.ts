import { resolve } from 'path';
import commands from '../src/commands';
import rimraf from 'rimraf';

import { defaultConfig } from '../src/config';
import scan from './util/scan';

const managementDir = resolve(__dirname, 'data/test-management');
const contentDir = resolve(__dirname, 'data/test-content');

const config = { ...defaultConfig, managementDir, contentDir };

function clean() {
  rimraf.sync(managementDir);
  rimraf.sync(contentDir);
}

describe('commands', () => {
  beforeAll(clean);
  afterEach(clean);
  describe('generate', () => {
    it('generates', async () => {});
  });
  describe('export', () => {
    it('exports', async () => {});
  });
  describe('import', () => {
    const csv = resolve(__dirname, './data/misc/import.csv');
    it('imports', async () => {
      await commands.import({ csv }, config);
      expect(await scan(contentDir)).toMatchSnapshot();
    });
  });
});
