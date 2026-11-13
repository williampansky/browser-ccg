import fs from 'fs';
import path from 'path';
import core from '../../../data/core.json';
import prime from '../../../data/prime.json';
import entourage from '../../../data/entourage.json';

// The card art folders must match the CURRENT card data. The Hearthstone-style rebuild reassigned card ids, and for a while
// SET_CORE kept `-DECK` / `-MINION` images (and some token art) from the old zone game, which showed a different card than the `-CARD` art.
// The `-MINION` images there now are new ones, named without the set prefix like PRIME's. The board still draws minions from `-CARD`.

const dir = (set: string) => path.join(__dirname, '../../../public/images/sets', set);
const files = (set: string) => fs.readdirSync(dir(set)).filter((f) => !f.startsWith('.')); // Finder's .DS_Store is not art
const ids = (rows: { id: string }[], prefix: string) => rows.map((r) => r.id).filter((id) => id.startsWith(prefix));

describe('SET_CORE art', () => {
  const coreIds = ids(core as { id: string }[], 'CORE_');
  const tokenIds = ids(entourage as { id: string }[], 'CORE_');
  const have = new Set(files('SET_CORE'));

  it('every CORE card has its -CARD art and its -DECK strip', () => {
    for (const id of coreIds) {
      const n = id.slice('CORE_'.length);
      expect([id, have.has(`${n}-CARD.jpg`), have.has(`${n}-DECK.jpg`)]).toEqual([id, true, true]);
    }
  });
  it('has no file for a card that is not in the data (old zone-game leftovers)', () => {
    const known = new Set([...coreIds, ...tokenIds]);
    const strays = Array.from(have).filter((f) => !known.has(`CORE_${f.split('-')[0]}`));
    expect(strays).toEqual([]);
  });
  it('names -MINION images like the other art (`012a-MINION.jpg`, no CORE_ prefix)', () => {
    expect(Array.from(have).filter((f) => f.endsWith('-MINION.jpg') && f.startsWith('CORE_'))).toEqual([]);
  });
});

describe('SET_PRIME art', () => {
  it('every named, active PRIME card has -CARD art, and nothing in the folder belongs to no card', () => {
    const have = new Set(files('SET_PRIME'));
    for (const c of (prime as { id: string; name?: string; active?: boolean }[]).filter((c) => c.name && c.active)) {
      expect([c.id, have.has(`${c.id.slice('PRIME_'.length)}-CARD.jpg`)]).toEqual([c.id, true]);
    }
    const known = new Set([...ids(prime as { id: string }[], 'PRIME_'), ...ids(entourage as { id: string }[], 'PRIME_')]);
    expect(Array.from(have).filter((f) => !known.has(`PRIME_${f.split('-')[0]}`))).toEqual([]);
  });
});
