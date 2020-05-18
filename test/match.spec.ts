import match from '../src/match';

const input = [
  { path: 'a.en.yaml', sig: 'a', locale: 'en' },
  { path: 'a.jp.yaml', sig: 'a', locale: 'jp' },
  { path: 'b.en.yaml', sig: 'a[0:test].thing', locale: 'en' },
  { path: 'b.jp.yaml', sig: 'a[0:test].thing', locale: 'jp' },
].map((item, i) => ({ ...item, value: 'a', key: 'b', vHash: 'c' }));

describe('match', () => {
  it('matches sibling translations', () => {
    expect(match(input)).toMatchSnapshot();
  });
});
