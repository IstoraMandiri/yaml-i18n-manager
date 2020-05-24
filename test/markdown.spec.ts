import { generateMarkdown } from '../src/markdown';
import fs from 'fs-extra';
import { defaultConfig } from '../src/config';
import rimraf from 'rimraf';
import scan from './util/scan';

const contentSrc = './test/data/content-input';
const contentDir = './test/data/test-markdown';

const config = { ...defaultConfig, contentDir };

describe('commands', () => {
  beforeEach(async () => {
    rimraf.sync(contentDir);
    await fs.copy(contentSrc, contentDir);
  });
  afterEach(() => {
    rimraf.sync(contentDir);
  });
  describe('markdown', () => {
    it('translates markdown', async () => {
      await generateMarkdown('ja', config);
      expect(await scan(contentDir)).toMatchSnapshot();
    });
  });
});
