import { CardDataError, loadCards, sanitizeText, stripSymbol } from '../load-cards';
import { loadHsCards } from '../load-hs-cards';
import type { LoadCardsInput, RawCard } from '../types';

/** A tiny, valid input to build failure cases from. */
const glossary = {
  mechanics: [
    { symbol: '%BULWARK%', name: 'Guard' },
    { symbol: '%DAMAGE%', name: 'Damage' },
    { symbol: '%TARGET%', name: 'Target' },
    { symbol: '%RANDOM%', name: 'Random' },
  ],
  constants: [{ symbol: '%RACE_SPRITE%', name: 'Sprite' }],
};

const input = (overrides: Partial<LoadCardsInput> = {}): LoadCardsInput => ({
  core: [],
  prime: [],
  entourage: [],
  ...glossary,
  ...overrides,
});

const spell = (extra: RawCard = {}): RawCard => ({
  id: 'CORE_900',
  name: 'Test Bolt',
  type: '%TYPE_SPELL%',
  cost: 1,
  rarity: '%RARITY_FREE%',
  set: '%SET_002%',
  ...extra,
});

describe('stripSymbol', () => {
  test('strips percent signs', () => {
    expect(stripSymbol('%RARITY_FREE%')).toBe('RARITY_FREE');
  });

  test('strips an Airtable select index', () => {
    expect(stripSymbol('0 %CLASS_NONE%')).toBe('CLASS_NONE');
  });

  test('returns undefined for non-symbols', () => {
    expect(stripSymbol('GLOBAL')).toBeUndefined();
    expect(stripSymbol(undefined)).toBeUndefined();
    expect(stripSymbol(3)).toBeUndefined();
  });
});

describe('sanitizeText', () => {
  test('turns every br variant, including the malformed one, into a space', () => {
    expect(sanitizeText('a<br>b<br />c<br >d')).toBe('a b c d');
  });

  test('removes other tags and collapses whitespace and newlines', () => {
    expect(sanitizeText('<strong>%BULWARK%</strong>\n  text<small>x</small>')).toBe('%BULWARK% textx');
  });
});

describe('loadCards: normalisation', () => {
  test('strips symbols and lowercases playType', () => {
    const { byId } = loadCards(
      input({
        core: [
          spell({
            playType: 'TARGETED',
            playContext: '%DAMAGE%',
            mechanics: ['%DAMAGE%', '%TARGET%'],
            cardClass: '0 %CLASS_NONE%',
          }),
        ],
      })
    );
    const card = byId.get('CORE_900')!;
    expect(card.type).toBe('spell');
    expect(card.rarity).toBe('FREE');
    expect(card.set).toBe('SET_002');
    expect(card.playType).toBe('targeted');
    expect(card.playContext).toBe('DAMAGE');
    expect(card.mechanics).toEqual(['DAMAGE', 'TARGET']);
  });

  test('keeps 0 as a real number and leaves absent numbers absent', () => {
    const { byId } = loadCards(input({ core: [spell({ numberPrimary: 0, numberSecondary: 2 })] }));
    const { numbers } = byId.get('CORE_900')!;
    expect(numbers.primary).toBe(0);
    expect(numbers.secondary).toBe(2);
    expect('random' in numbers).toBe(false);
    expect('overcharge' in numbers).toBe(false);
  });

  test('numberRNG and numberRandom both become numbers.random', () => {
    const rng = loadCards(input({ core: [spell({ numberRNG: 3 })] })).byId.get('CORE_900')!;
    const random = loadCards(input({ prime: [spell({ numberRandom: 2 })] })).byId.get('CORE_900')!;
    expect(rng.numbers.random).toBe(3);
    expect(random.numbers.random).toBe(2);
  });

  test('booleans: absent means false, except tokens which count as active', () => {
    const { byId } = loadCards(
      input({
        core: [spell({ id: 'CORE_901', active: true, elite: true, collectible: true })],
        prime: [spell({ id: 'PRIME_901' })],
        entourage: [spell({ id: 'CORE_901a', isEntourage: true })],
      })
    );
    expect(byId.get('CORE_901')).toMatchObject({ active: true, elite: true, collectible: true, isToken: false });
    expect(byId.get('PRIME_901')).toMatchObject({ active: false, elite: false, collectible: false });
    expect(byId.get('CORE_901a')).toMatchObject({ active: true, isToken: true });
  });

  test('substitutes number tokens and glossary names in text', () => {
    const { byId } = loadCards(
      input({
        core: [
          spell({
            text: '<strong>%BULWARK%</strong> Deal %NUM% to %NUM2%<br />%RACE_SPRITE%s',
            numberPrimary: 4,
            numberSecondary: 1,
          }),
        ],
      })
    );
    const card = byId.get('CORE_900')!;
    expect(card.textTemplate).toBe('%BULWARK% Deal %NUM% to %NUM2% %RACE_SPRITE%s');
    expect(card.text).toBe('Guard Deal 4 to 1 Sprites');
  });

  test('%NUM1% reads numberPrimary', () => {
    const { byId } = loadCards(input({ core: [spell({ text: 'Deal %NUM1%', numberPrimary: 7 })] }));
    expect(byId.get('CORE_900')!.text).toBe('Deal 7');
  });

  test('resolves entourage ids, applies the known typo fix, and reports unresolved ones', () => {
    const { byId, issues } = loadCards(
      input({
        prime: [spell({ id: 'PRIME_112', entourage: 'PRIME112a, PRIME_999' })],
        entourage: [spell({ id: 'PRIME_112a', isEntourage: true })],
      })
    );
    expect(byId.get('PRIME_112')!.entourage).toEqual(['PRIME_112a']);
    const unresolved = issues.filter((i) => i.code === 'unresolved-entourage');
    expect(unresolved).toHaveLength(1);
    expect(unresolved[0].message).toContain('PRIME_999');
  });

  test('reports (not hides) a missing name and a playType/TARGET mismatch', () => {
    const { issues } = loadCards(
      input({ core: [spell({ name: undefined, playType: 'TARGETED', mechanics: ['%DAMAGE%'] })] })
    );
    expect(issues.map((i) => i.code).sort()).toEqual(['missing-name', 'playtype-target-mismatch']);
    expect(issues.every((i) => i.level === 'warning')).toBe(true);
  });
});

describe('loadCards: fails loudly', () => {
  test('an unknown mechanic symbol throws', () => {
    expect(() => loadCards(input({ core: [spell({ mechanics: ['%NOT_A_MECHANIC%'] })] }))).toThrow(CardDataError);
  });

  test('a duplicate id throws', () => {
    expect(() => loadCards(input({ core: [spell(), spell()] }))).toThrow(/duplicate-id/);
  });

  test('an unknown type, a missing cost, and a non-numeric number all throw', () => {
    expect(() => loadCards(input({ core: [spell({ type: '%TYPE_WIZARD%' })] }))).toThrow(/unknown-type/);
    expect(() => loadCards(input({ core: [spell({ cost: undefined })] }))).toThrow(/missing-field/);
    expect(() => loadCards(input({ core: [spell({ numberPrimary: 'lots' })] }))).toThrow(/bad-number/);
  });

  test('both numberRNG and numberRandom is an error', () => {
    expect(() => loadCards(input({ core: [spell({ numberRNG: 1, numberRandom: 1 })] }))).toThrow(/numbers-conflict/);
  });

  test('strict: false returns the issues instead of throwing', () => {
    const result = loadCards(input({ core: [spell({ mechanics: ['%NOPE%'] })] }), { strict: false });
    expect(result.issues.some((i) => i.code === 'unknown-mechanic')).toBe(true);
  });
});

/**
 * Tests against the committed data (`data/hs/`, pulled with `npm run airtable:hs`).
 * Expected numbers were computed independently from the raw JSON. If you re-pull the data and a
 * count here changes, check that the change is real before updating the number.
 */
describe('loadHsCards: the committed card data', () => {
  const { cards, byId, issues } = loadHsCards();
  const bySource = (source: string) => cards.filter((c) => c.source === source);

  test('loads without errors, with the expected record counts', () => {
    expect(cards).toHaveLength(430);
    expect(bySource('core')).toHaveLength(132);
    expect(bySource('prime')).toHaveLength(254);
    expect(bySource('entourage')).toHaveLength(43);
    expect(bySource('game')).toHaveLength(1);
    expect(issues.filter((i) => i.level === 'error')).toEqual([]);
  });

  test('CORE has the expected type split', () => {
    const core = bySource('core');
    const count = (type: string) => core.filter((c) => c.type === type).length;
    expect([count('minion'), count('spell'), count('item'), count('weapon')]).toEqual([59, 52, 16, 5]);
  });

  test('every CORE card is active and none is a token', () => {
    expect(bySource('core').every((c) => c.active && !c.isToken)).toBe(true);
  });

  test('22 PRIME cards are inactive; every token counts as active', () => {
    expect(bySource('prime').filter((c) => !c.active)).toHaveLength(22);
    expect(bySource('entourage').every((c) => c.active && c.isToken)).toBe(true);
  });

  test('every minion has attack and health, including the NO_ATTACK ones', () => {
    const minions = cards.filter((c) => c.type === 'minion');
    expect(minions.length).toBeGreaterThan(0);
    expect(minions.every((c) => c.attack !== undefined && c.health !== undefined)).toBe(true);
    expect(byId.get('PRIME_014')).toMatchObject({ attack: 4, health: 2 });
  });

  test('every weapon has attack and durability (health)', () => {
    const weapons = cards.filter((c) => c.type === 'weapon');
    expect(weapons).toHaveLength(20);
    expect(weapons.every((c) => c.attack !== undefined && c.health !== undefined)).toBe(true);
  });

  test('0 is preserved: CORE_006 has numberPrimary 0 and numberSecondary 2', () => {
    expect(byId.get('CORE_006')!.numbers).toMatchObject({ primary: 0, secondary: 2 });
  });

  test('a known card renders correctly (Fireballs)', () => {
    const card = byId.get('CORE_063')!;
    expect(card.name).toBe('Fireballs');
    expect(card.type).toBe('spell');
    expect(card.playType).toBe('global');
    expect(card.numbers).toEqual({ primary: 1, random: 3 });
    expect(card.mechanics).toEqual(['RANDOM', 'DAMAGE']);
    // Glossary display names keep their capitalisation, so "Random" is capitalised mid-sentence.
    // The engine never reads `text`; it is for display only.
    expect(card.text).toBe('Deal 1 damage to three Random enemies');
  });

  test('the glossary supplies the game\'s own display names (Guard, Stampede, Warcry)', () => {
    const guard = cards.find((c) => c.mechanics.includes('BULWARK') && c.textTemplate === '%BULWARK%')!;
    expect(guard.text).toBe('Guard');
    expect(cards.some((c) => c.text.includes('Stampede'))).toBe(true);
    expect(cards.some((c) => c.text.includes('Warcry'))).toBe(true);
  });

  test('no card text contains HTML or an unresolved number token', () => {
    cards.forEach((c) => {
      expect(c.text).not.toMatch(/<[^>]+>/);
      expect(c.text).not.toMatch(/%NUM[12]?%/);
    });
  });

  test('printed number tokens always have a number to substitute (RULES.md Q23 consistency check)', () => {
    expect(issues.filter((i) => i.code === 'text-number-missing')).toEqual([]);
    expect(issues.filter((i) => i.code === 'unknown-text-token')).toEqual([]);
  });

  test('the PRIME112a typo is fixed; 17 other entourage references are still dangling', () => {
    expect(byId.get('PRIME_112')!.entourage).toContain('PRIME_112a');
    expect(issues.filter((i) => i.code === 'unresolved-entourage')).toHaveLength(17);
  });

  test('57 cards have no name and 35 cards disagree about targeting (reported, not hidden)', () => {
    expect(issues.filter((i) => i.code === 'missing-name')).toHaveLength(57);
    expect(issues.filter((i) => i.code === 'playtype-target-mismatch')).toHaveLength(35);
  });
});

describe('loadHsCards: game cards', () => {
  it('includes The Orb (GAME_001), the second player bonus spell', () => {
    const orb = loadHsCards().byId.get('GAME_001');
    expect(orb).toMatchObject({ source: 'game', type: 'spell', cost: 0, playType: 'global', numbers: { primary: 1 } });
  });
});
