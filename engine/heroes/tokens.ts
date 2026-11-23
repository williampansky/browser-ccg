import type { Card, CardCatalog } from '../cards/types';

/**
 * Minions and weapons that hero skills create. They are not in Airtable (the
 * ability rows carry only numbers), so they
 * are defined here; a token with no art file shows the placeholder art. Ids
 * start with `HERO_` so they never clash with
 * a card id.
 */
const token = (
  id: string,
  name: string,
  type: 'minion' | 'weapon',
  attack: number,
  health: number,
  text: string,
  mechanics: string[] = [],
): Card => ({
  id,
  source: 'entourage',
  name,
  type,
  cost: 0,
  attack,
  health,
  ...(type === 'minion' ? { race: 'CREATURE', raceName: 'Creature' } : {}),
  rarity: 'FREE',
  set: 'HERO',
  mechanics,
  numbers: {},
  textTemplate: text,
  text,
  richText: text,
  entourage: [],
  isToken: true,
  elite: false,
  active: true,
  collectible: false,
});

/** A token with no race, so a race synergy ("your Creatures ...") skips it. */
const raceless = (card: Card): Card => ({
  ...card,
  race: undefined,
  raceName: undefined,
});

export const HERO_TOKENS: Card[] = [
  token('HERO_EXILE_EAGLE', 'Eagle', 'minion', 4, 2, 'Stampede', ['RUSH']),
  token('HERO_EXILE_BEAST', 'The Beast', 'minion', 8, 8, ''),
  token('HERO_DRUID_WOLF', 'Spirit Wolf', 'minion', 3, 2, ''),
  token('HERO_DRUID_BEAR', 'Spirit Bear', 'minion', 2, 5, 'Guard', ['BULWARK']),
  token('HERO_DRUID_HAWK', 'Spirit Hawk', 'minion', 2, 1, 'Stampede', ['RUSH']),
  raceless(token('HERO_CRUSADER_RECRUIT', 'Recruit', 'minion', 1, 1, '')),
  raceless(token('HERO_MYSTIC_EMBER', 'Ember Totem', 'minion', 1, 1, '')),
  raceless(
    token('HERO_MYSTIC_STONE', 'Stone Totem', 'minion', 0, 2, 'Guard', [
      'BULWARK',
    ]),
  ),
  raceless(
    token(
      'HERO_MYSTIC_SPRING',
      'Spring Totem',
      'minion',
      0,
      2,
      'At the end of your turn, heal your minions 1',
    ),
  ),
  raceless(
    token('HERO_MYSTIC_GALE', 'Gale Totem', 'minion', 0, 2, '+1 Spell Damage', [
      'SPELL_DAMAGE',
    ]),
  ),
  token('HERO_ASSASSIN_DAGGER', 'Dagger', 'weapon', 1, 2, ''),
];

export const heroToken = (id: string): Card => {
  const card = HERO_TOKENS.find((c) => c.id === id);
  if (!card) throw new Error(`no hero token ${id}`);
  return card;
};

/**
 * The catalog plus the hero tokens: use this wherever a game with heroes is
 * played or drawn.
 */
export const withHeroTokens = (catalog: CardCatalog): Map<string, Card> => {
  const out = new Map(catalog);
  for (const c of HERO_TOKENS) out.set(c.id, c);
  return out;
};

/**
 * A hero skill drawn as a card (for the cast popup when an ultimate is used): a
 * spell with the skill's name, cost and text.
 */
export const skillCard = (
  heroId: string,
  skill: {
    index: number;
    name: string;
    cost: number;
    text: string;
    rarity?: string;
  },
): Card => ({
  ...token(
    `HERO_SKILL_${heroId}_${skill.index}`,
    skill.name,
    'minion',
    0,
    0,
    skill.text,
  ),
  type: 'spell',
  attack: undefined,
  health: undefined,
  race: undefined,
  raceName: undefined,
  cost: skill.cost,
  rarity: skill.rarity ?? 'FREE',
});
