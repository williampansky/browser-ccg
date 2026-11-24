import fs from 'fs';
import { CatalogPack, findAssets, iconFile } from '../asset-catalog';

const packs: CatalogPack[] = [
  {
    id: 'elemental',
    prefix: 'elemental-magic-icons-',
    suffix: '.png',
    icons: { '9966': 'skull, poison, green', '9985': 'meteor shower, orange' },
  },
  {
    id: 'potion',
    prefix: 'rpg-potion-icons-black-',
    suffix: '_b.png',
    icons: { '8915': 'green potion, skull stopper, poison' },
  },
];

describe('findAssets', () => {
  it('needs every word to match, in any case', () => {
    const found = findAssets(packs, ['SKULL', 'poison']).map((m) => m.file);

    expect(found).toEqual([
      'elemental-magic-icons-9966.png',
      'rpg-potion-icons-black-8915_b.png',
    ]);
  });
  it('matches the pack id too', () => {
    expect(findAssets(packs, ['potion', 'skull']).map((m) => m.pack)).toEqual([
      'potion',
    ]);
  });
  it('finds nothing when one word matches nowhere', () => {
    expect(findAssets(packs, ['skull', 'dragon'])).toEqual([]);
  });
  it('builds the file name from the prefix, key and suffix', () => {
    expect(iconFile(packs[1], '8915')).toBe(
      'rpg-potion-icons-black-8915_b.png',
    );
  });
});

describe('art-assets-catalog.json', () => {
  const { packs: catalog } = JSON.parse(
    fs.readFileSync('art-assets-catalog.json', 'utf8'),
  ) as { packs: CatalogPack[] };

  it('has a non-empty description for every icon, with numeric keys', () => {
    for (const pack of catalog) {
      for (const [key, tags] of Object.entries(pack.icons)) {
        expect(`${pack.id} ${key}`).toMatch(/ \d+$/);
        expect(tags.trim()).not.toBe('');
      }
    }
  });
  it('gives every pack its own file-name prefix', () => {
    const prefixes = catalog.map((pack) => pack.prefix);

    expect(new Set(prefixes).size).toBe(prefixes.length);
  });
});
