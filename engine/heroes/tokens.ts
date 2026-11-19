import type { Card, CardCatalog } from '../cards/types';

/**
 * Minions and weapons that hero skills create. They are not in Airtable (the ability rows carry only numbers), so they
 * are defined here; a token with no art file shows the placeholder art. Ids start with `HERO_` so they never clash with
 * a card id.
 */
const token = (
  id: string,
  name: string,
  type: 'minion' | 'weapon',
  attack: number,
  health: number,
  text: string,
  mechanics: string[] = []
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

export const HERO_TOKENS: Card[] = [
  token('HERO_EXILE_EAGLE', 'Eagle', 'minion', 4, 2, 'Stampede', ['RUSH']),
  token('HERO_EXILE_BEAST', 'The Beast', 'minion', 8, 8, ''),
  token('HERO_DRUID_WOLF', 'Spirit Wolf', 'minion', 3, 2, ''),
  token('HERO_DRUID_BEAR', 'Spirit Bear', 'minion', 2, 5, 'Guard', ['BULWARK']),
  token('HERO_DRUID_HAWK', 'Spirit Hawk', 'minion', 2, 1, 'Stampede', ['RUSH']),
  token('HERO_DRUID_CLAWS', 'True Claws', 'weapon', 5, 2, ''),
];

export const heroToken = (id: string): Card => {
  const card = HERO_TOKENS.find((c) => c.id === id);
  if (!card) throw new Error(`no hero token ${id}`);
  return card;
};

/** The catalog plus the hero tokens: use this wherever a game with heroes is played or drawn. */
export const withHeroTokens = (catalog: CardCatalog): Map<string, Card> => {
  const out = new Map(catalog);
  for (const c of HERO_TOKENS) out.set(c.id, c);
  return out;
};

/** A hero skill drawn as a card (for the cast popup when an ultimate is used): a spell with the skill's name, cost and text. */
export const skillCard = (heroId: string, skill: { index: number; name: string; cost: number; text: string; rarity?: string }): Card => ({
  ...token(`HERO_SKILL_${heroId}_${skill.index}`, skill.name, 'minion', 0, 0, skill.text),
  type: 'spell',
  attack: undefined,
  health: undefined,
  race: undefined,
  raceName: undefined,
  cost: skill.cost,
  rarity: skill.rarity ?? 'FREE',
});
