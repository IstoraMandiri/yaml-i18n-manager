import rimraf from 'rimraf';
import fs from 'fs-extra';

import eject from '../src/eject';

import translatedYaml from './data/misc/translated.json';
import scan from './util/scan';

const outDir = `./test/data/out-temp`;
const mergeSrc = './test/data/merge';
const mergeTest = './test/data/merge-test';

function clean() {
  rimraf.sync(outDir);
}
describe('eject', () => {
  beforeAll(clean);
  afterEach(clean);
  it('ejects freshly correctly', async () => {
    await eject(translatedYaml, outDir);
    expect(await scan(outDir)).toMatchSnapshot();
  });
  describe('merging', () => {
    beforeEach(async () => {
      rimraf.sync(mergeTest);
      await fs.copy(mergeSrc, mergeTest);
    });
    afterEach(async () => {
      rimraf.sync(mergeTest);
    });
    it('merges correctly', async () => {
      await eject(translatedYaml, mergeTest);
      expect(await scan(mergeTest)).toMatchSnapshot();
    });
  });
});
