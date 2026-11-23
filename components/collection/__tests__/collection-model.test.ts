import { loadHsCards } from '../../../engine';
import { effectsOf } from '../../../engine';
import {
  DEFAULT_FILTERS,
  fromQuery,
  toQuery,
  effectOptions,
  filterCards,
  isFiltered,
  loadSize,
  raceOptions,
  RARITIES,
  saveSize,
  sizeOf,
  SIZES,
  sortCards,
} from '../collection-model';

const cards = Array.from(loadHsCards().byId.values()).filter(
  (c) => c.name && !c.isToken,
);
const f = (over: Partial<typeof DEFAULT_FILTERS>) => ({
  ...DEFAULT_FILTERS,
  ...over,
});

describe('filterCards', () => {
  it('shows everything with the default filters', () => {
    expect(filterCards(cards, DEFAULT_FILTERS)).toHaveLength(cards.length);
  });

  it('filters by rarity, and every rarity picks something', () => {
    for (const r of RARITIES) {
      const got = filterCards(cards, f({ rarity: r.id }));
      expect(got.length).toBeGreaterThan(0);
      expect(got.every((c) => c.rarity === r.id)).toBe(true);
    }
  });

  it('filters by effect (a card has it when it is in effectsOf)', () => {
    const got = filterCards(cards, f({ effect: 'RUSH' }));
    expect(got.length).toBeGreaterThan(0);
    expect(
      got.every((c) => effectsOf(c).some((e) => e.symbol === 'RUSH')),
    ).toBe(true);
    expect(
      cards.filter((c) => effectsOf(c).some((e) => e.symbol === 'RUSH')),
    ).toHaveLength(got.length);
  });

  it('filters by race, which only minions have', () => {
    const race = raceOptions(cards)[0].value;
    const got = filterCards(cards, f({ race }));
    expect(got.length).toBeGreaterThan(0);
    expect(got.every((c) => c.type === 'minion' && c.race === race)).toBe(true);
  });

  it('combines filters, and "7+" means seven or more', () => {
    const got = filterCards(cards, f({ cost: '7+', type: 'minion' }));
    expect(got.length).toBeGreaterThan(0);
    expect(got.every((c) => c.cost >= 7 && c.type === 'minion')).toBe(true);
  });

  it('searches the name and the text, ignoring case and spaces at the ends', () => {
    const c = cards.find((x) => x.id === 'CORE_007')!;
    expect(
      filterCards(cards, f({ search: `  ${c.name!.toUpperCase()} ` })).map(
        (x) => x.id,
      ),
    ).toContain('CORE_007');
    expect(filterCards(cards, f({ search: 'zzzz-no-such-card' }))).toEqual([]);
  });
});

describe('options', () => {
  it('lists each effect and race once, sorted by display name, and only ones some card has', () => {
    const effects = effectOptions(cards);
    expect(new Set(effects.map((e) => e.value)).size).toBe(effects.length);
    expect(effects.map((e) => e.label)).toEqual(
      [...effects.map((e) => e.label)].sort((a, b) => a.localeCompare(b)),
    );
    for (const e of effects)
      expect(filterCards(cards, f({ effect: e.value })).length).toBeGreaterThan(
        0,
      );
    const races = raceOptions(cards);
    expect(races.every((r) => r.value !== 'NONE' && r.label)).toBe(true);
  });
});

describe('sortCards', () => {
  it('sorts by cost, then name, without changing the input', () => {
    const before = cards.map((c) => c.id);
    const got = sortCards(cards, 'cost');
    expect(cards.map((c) => c.id)).toEqual(before);
    for (let i = 1; i < got.length; i++)
      expect(got[i - 1].cost).toBeLessThanOrEqual(got[i].cost);
  });

  it('sorts by rarity from Free to Mythic', () => {
    const order: string[] = RARITIES.map((r) => r.id);
    const got = sortCards(cards, 'rarity');
    for (let i = 1; i < got.length; i++)
      expect(order.indexOf(got[i - 1].rarity)).toBeLessThanOrEqual(
        order.indexOf(got[i].rarity),
      );
  });

  it('sorts attack and health high to low, with cards that have none last', () => {
    for (const key of ['attack', 'health'] as const) {
      const got = sortCards(cards, key);
      const vals = got.map((c) => c[key]);
      const firstNone = vals.findIndex((v) => v === undefined);
      expect(
        vals
          .slice(0, firstNone < 0 ? undefined : firstNone)
          .every((v, i, a) => i === 0 || a[i - 1]! >= v!),
      ).toBe(true);
      if (firstNone >= 0)
        expect(vals.slice(firstNone).every((v) => v === undefined)).toBe(true);
    }
  });
});

describe('isFiltered', () => {
  it('is false for the defaults and true when anything differs', () => {
    expect(isFiltered(DEFAULT_FILTERS)).toBe(false);
    expect(isFiltered(f({ rarity: 'MYTHIC' }))).toBe(true);
    expect(isFiltered(f({ search: 'x' }))).toBe(true);
  });
});

describe('grid sizes', () => {
  it('has a few increasing sizes, and an unknown id falls back to the medium one', () => {
    expect(SIZES.length).toBeGreaterThanOrEqual(3);
    for (let i = 1; i < SIZES.length; i++)
      expect(SIZES[i].width).toBeGreaterThan(SIZES[i - 1].width);
    expect(sizeOf('nonsense').id).toBe('medium');
    expect(sizeOf('large').width).toBeGreaterThan(sizeOf('medium').width);
  });

  it('remembers the chosen size in this browser, and ignores junk', () => {
    expect(loadSize()).toBe('medium');
    saveSize('large');
    expect(loadSize()).toBe('large');
    window.localStorage.setItem('ccg.collection.v1', '{not json');
    expect(loadSize()).toBe('medium');
    window.localStorage.setItem(
      'ccg.collection.v1',
      JSON.stringify({ size: 'gigantic' }),
    );
    expect(loadSize()).toBe('medium');
  });
});

describe('URL params', () => {
  it('writes only non-default filters and reads them back', () => {
    expect(toQuery(DEFAULT_FILTERS, 'cost', 'all')).toEqual({});
    const f = {
      ...DEFAULT_FILTERS,
      search: 'orc',
      type: 'spell' as const,
      cost: '3' as const,
    };
    const q = toQuery(f, 'name', 'fpo');
    expect(q).toEqual({
      q: 'orc',
      type: 'spell',
      cost: '3',
      sort: 'name',
      art: 'fpo',
    });
    expect(fromQuery(q)).toEqual({
      filters: f,
      sort: 'name',
      art: 'fpo',
      tokens: false,
    });
  });
  it('ignores invalid values', () => {
    expect(
      fromQuery({ type: 'bogus', cost: ['2', '3'], sort: 'x', art: 'y' }),
    ).toEqual({
      filters: { ...DEFAULT_FILTERS, cost: '2' },
      sort: 'cost',
      art: 'all',
      tokens: false,
    });
    expect(
      fromQuery(toQuery(DEFAULT_FILTERS, 'cost', 'all', true)),
    ).toMatchObject({ tokens: true });
  });
});

describe('entourage cards and the set filter', () => {
  const tokens = Array.from(loadHsCards().byId.values()).filter(
    (c) => c.isToken && c.name,
  );
  it('follow the set in their id: Core shows only CORE tokens, Prime only PRIME ones', () => {
    const core = filterCards(tokens, f({ set: 'core' }));
    const prime = filterCards(tokens, f({ set: 'prime' }));
    expect(core.length).toBeGreaterThan(0);
    expect(prime.length).toBeGreaterThan(0);
    expect(core.every((c) => c.id.startsWith('CORE_'))).toBe(true);
    expect(prime.every((c) => c.id.startsWith('PRIME_'))).toBe(true);
    expect(core.length + prime.length).toBe(
      filterCards(tokens, f({ set: 'both' })).length,
    );
  });
});

describe('class filter', () => {
  const withClass = [
    ...cards,
    ...Array.from(loadHsCards().byId.values()).filter(
      (c) => c.id === 'PRIME_255',
    ),
  ];
  it('Neutral hides class cards, a hero shows only its own', () => {
    expect(
      filterCards(withClass, f({ hero: 'neutral' })).some((c) => c.heroClass),
    ).toBe(false);
    expect(
      filterCards(withClass, f({ hero: 'WARRIOR' })).map((c) => c.id),
    ).toContain('PRIME_255');
    expect(filterCards(withClass, f({ hero: 'ZEUS' }))).toHaveLength(0);
  });
  it('round-trips through the URL', () => {
    const q = toQuery(f({ hero: 'WARRIOR' }), 'cost', 'all');
    expect(q.class).toBe('WARRIOR');
    expect(fromQuery(q).filters.hero).toBe('WARRIOR');
  });
});

describe('search by id', () => {
  it('finds a card by its full id, any case, or by the number part', () => {
    expect(
      filterCards(cards, f({ search: 'CORE_076' })).map((c) => c.id),
    ).toContain('CORE_076');
    expect(
      filterCards(cards, f({ search: 'core_076' })).map((c) => c.id),
    ).toContain('CORE_076');
    expect(filterCards(cards, f({ search: '076' })).map((c) => c.id)).toContain(
      'CORE_076',
    );
  });
  it('finds a card that has no name in the data (named by its id)', () => {
    const unnamed = cards.filter((c) => c.name === c.id);
    expect(unnamed.length).toBeGreaterThan(0);
    expect(
      filterCards(cards, f({ search: unnamed[0].id })).map((c) => c.id),
    ).toContain(unnamed[0].id);
  });
});
