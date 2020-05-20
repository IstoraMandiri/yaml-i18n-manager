import { resolve } from 'path';
import data from './data/misc/translated.json';
import { generate, parse } from '../src/csv';
import rimraf from 'rimraf';
import fs from 'fs-extra';
import scan from './util/scan';

const sampleImport = resolve(__dirname, './data/misc/import.csv');
const testDir = resolve(__dirname, './data/csv-test');

describe('csv', () => {
  beforeEach(async () => {
    rimraf.sync(testDir);
    await fs.mkdir(testDir);
  });
  afterEach(() => {
    rimraf.sync(testDir);
  });
  it('generates csv', async () => {
    await generate(data, `${testDir}/ja.csv`);
    expect(await scan(testDir)).toMatchSnapshot();
  });
  it('creates backup csvs', async () => {
    await generate(data, `${testDir}/ja.csv`);
    await generate(data, `${testDir}/ja.csv`);
    await generate(data, `${testDir}/ja.csv`);
    await generate(data, `${testDir}/ja.csv`);
    expect(await scan(testDir)).toMatchSnapshot();
  });
  it('parses csv', async () => {
    expect(await parse(sampleImport)).toMatchSnapshot();
  });
});
