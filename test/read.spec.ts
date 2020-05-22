import read from '../src/read';
import { defaultConfig } from '../src/config';

const target = './test/data/content-input';

const config = { ...defaultConfig, contentDir: target };

describe('read', () => {
  it('returns the key/values', async () => {
    expect(await read(config)).toMatchSnapshot();
  });
});
