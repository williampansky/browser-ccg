import {
  EVENT_FX,
  EVENT_KEYS,
  spellFxFor,
  spellFxForKey,
  spellFxMs,
  spellFxTotalMs,
  spellKeyFor,
} from '../spell-fx';
import { SPELL_FX_DEFAULTS } from '../spell-fx-tune';

describe('spellFxFor', () => {
  it('gives the Wizard first skill the strike base', () => {
    expect(
      spellFxFor({ type: 'HeroSkill', skill: 0 }, 'WIZARD', undefined),
    ).toBe('strike');
  });

  it('keeps a skill from borrowing a card look, and the reverse', () => {
    expect(
      spellFxFor({ type: 'HeroSkill', skill: 0 }, 'RANGER', undefined),
    ).toBe('travel');
    expect(
      spellFxFor({ type: 'PlayCard', handIndex: 0 }, 'WIZARD', 'CORE_069'),
    ).toBe('travel');
  });

  it('falls back to the travel base for anything else', () => {
    expect(spellFxFor({ type: 'EndTurn' }, 'WIZARD', undefined)).toBe('travel');
  });
});

describe('spellKeyFor and spellFxForKey', () => {
  it('keys a skill by class and number, a card by its id', () => {
    expect(
      spellKeyFor({ type: 'HeroSkill', skill: 0 }, 'WIZARD', undefined),
    ).toBe('WIZARD:1');
    expect(
      spellKeyFor({ type: 'PlayCard', handIndex: 2 }, 'WIZARD', 'CORE_069'),
    ).toBe('CORE_069');
    expect(spellKeyFor({ type: 'EndTurn' }, 'WIZARD', undefined)).toBeNull();
  });

  it('looks an effect up by key, defaulting to the orb', () => {
    expect(spellFxForKey('WIZARD:1')).toBe('strike');
    expect(spellFxForKey('CORE_069')).toBe('travel');
  });
});

describe('the spot kind', () => {
  it('gives the Fighter first skill the spot base', () => {
    expect(spellFxForKey('FIGHTER:1')).toBe('spot');
  });

  it('starts at the cast, so its hit delay is zero', () => {
    expect(spellFxMs('spot', SPELL_FX_DEFAULTS)).toBe(0);
    expect(spellFxMs('travel', SPELL_FX_DEFAULTS)).toBe(
      SPELL_FX_DEFAULTS.travelMs,
    );
  });
});

describe('event effects', () => {
  it('gives every summon the spot base', () => {
    expect(spellFxForKey('summon')).toBe('spot');
  });
});

describe('inherited base', () => {
  it('gives a summoning skill its parent base without an entry of its own', () => {
    expect(spellFxForKey('CRUSADER:1')).toBe('spot');
    expect(spellFxForKey('MYSTIC:1')).toBe('spot');
  });
});

describe('the area base', () => {
  it('is assigned to CORE_098 and lands its damage part-way through', () => {
    expect(spellFxForKey('CORE_098')).toBe('area');
    expect(spellFxMs('area', SPELL_FX_DEFAULTS)).toBe(
      SPELL_FX_DEFAULTS.areaImpactMs,
    );
  });
});

describe('event effects', () => {
  it('lists heal, buff and death as events that start off', () => {
    expect(EVENT_KEYS).toEqual(['summon', 'heal', 'buff', 'death']);
    expect('summon' in EVENT_FX).toBe(true);
    for (const event of ['heal', 'buff', 'death']) {
      expect(event in EVENT_FX).toBe(false);
      expect(spellFxForKey(event)).toBe('spot');
    }
  });
});

describe('spellFxTotalMs', () => {
  const tune = { ...SPELL_FX_DEFAULTS, volleyDelay: 100 };

  it('is never shorter than the first impact', () => {
    (['travel', 'strike', 'spot', 'area'] as const).forEach((kind) => {
      expect(spellFxTotalMs(kind, tune)).toBeGreaterThanOrEqual(
        spellFxMs(kind, tune),
      );
    });
  });

  it('adds the volley: each later animation starts volleyDelay after the last', () => {
    expect(spellFxTotalMs('travel', tune, 4)).toBe(
      spellFxTotalMs('travel', tune, 1) + 300,
    );
  });

  it('runs a spot effect for its whole life, rings included', () => {
    const rings = { ...tune, spotRings: 2, spotRingGap: 250, spotLife: 1000 };

    expect(spellFxTotalMs('spot', rings)).toBe(1250);
  });
});
