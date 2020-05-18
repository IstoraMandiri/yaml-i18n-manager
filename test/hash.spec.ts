import hash from '../src/hash';

describe('hash', () => {
  it('hashes', async () => {
    expect(hash('hello')).toMatchSnapshot();
  });
});
