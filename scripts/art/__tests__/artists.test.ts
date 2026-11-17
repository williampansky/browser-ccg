import { collectArtists } from '../artists';

describe('collectArtists', () => {
  const rows = [
    { artistName: 'Rexard', artistUrl: 'https://a.example/rexard' },
    { artistName: 'rexard ', artistUrl: 'https://a.example/rexard' },
    { artistName: 'Boyko', artistUrl: 'https://x.example/1' },
    { artistName: 'Boyko', artistUrl: 'https://x.example/2' },
    { artistName: 'Boyko', artistUrl: 'https://x.example/2' },
    { artistName: 'Solo' },
    { artistUrl: 'https://orphan.example' },
    { artistName: 5, artistUrl: null },
    {},
  ];
  const out = collectArtists(rows);

  it('lists each name once, trimmed and sorted ignoring case', () => expect(out.names).toEqual(['Boyko', 'Rexard', 'rexard', 'Solo']));
  it('lists each URL once, sorted', () => expect(out.urls).toEqual(['https://a.example/rexard', 'https://orphan.example', 'https://x.example/1', 'https://x.example/2']));
  it('orders the URLs for a name by how often they are used', () => expect(out.urlsByName.Boyko).toEqual(['https://x.example/2', 'https://x.example/1']));
  it('has no URL entry for a name without one', () => expect(out.urlsByName.Solo).toBeUndefined());
  it('copes with nothing', () => expect(collectArtists([])).toEqual({ names: [], urls: [], urlsByName: {} }));
});
