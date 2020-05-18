import rimraf from 'rimraf';
import { resolve, relative } from 'path';
import { promises } from 'fs';
const { readdir, readFile } = promises;

import translatedYaml from './data/misc/translated.json';

import write from '../src/write';

async function scanFiles(root: string, dir?: string): Promise<any[]> {
  const target = dir || root;
  const dirEntries = await readdir(target, { withFileTypes: true });
  const files = await Promise.all(
    dirEntries.map(async (entry) => {
      const res = resolve(target, entry.name);
      return entry.isDirectory()
        ? scanFiles(root, res)
        : { fileName: relative(__dirname, res), content: await readFile(res, 'utf8') };
    }),
  );
  return Array.prototype.concat(...files);
}

const outDir = `./test/data/out-temp`;

describe('write', () => {
  beforeAll(() => rimraf.sync(outDir));
  afterAll(() => rimraf.sync(outDir));
  it('writes files correctly', async () => {
    await write(translatedYaml, outDir);
    expect(await scanFiles(outDir)).toMatchSnapshot();
  });
});
