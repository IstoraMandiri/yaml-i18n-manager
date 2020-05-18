import read from '../src/read';

const target = './test/data/content-input';

describe('read', () => {
  it('returns the key/values', async () => {
    expect(await read(target)).toMatchSnapshot();
  });
});
