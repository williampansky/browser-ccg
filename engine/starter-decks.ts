import type { Card } from './cards/types';

import { MAX_DECK_SIZE } from './deck-rules';

export const DECK_SIZE = MAX_DECK_SIZE;

export interface StarterDeck {
  name: string;
  /** What the deck is trying to do, for the win-rate table */
  plan: string;
  /** Lower is picked first; cards are taken by ascending score, ties by id (so decks are deterministic) */
  score: (c: Card) => number;
}

const isCreature = (c: Card) => c.type === 'minion';
const stats = (c: Card) => (c.attack ?? 0) + (c.health ?? 0);

/** Three archetypes, built from whatever cards the engine supports, so they grow with the pool. */
export const STARTER_DECKS: StarterDeck[] = [
  {
    name: 'Aggro',
    plan: 'cheap minions and weapons, low curve',
    score: (c) => c.cost * 10 + (isCreature(c) || c.type === 'weapon' ? 0 : 25) - (c.attack ?? 0),
  },
  {
    name: 'Midrange',
    plan: 'a balanced curve around 3 to 4 mana, mostly minions',
    score: (c) => Math.abs(c.cost - 3.5) * 10 + (isCreature(c) ? 0 : 12) - stats(c) / 4,
  },
  {
    name: 'Control',
    plan: 'spells and expensive, high-stat minions',
    score: (c) => 100 - c.cost * 8 - (c.type === 'spell' ? 18 : 0) - stats(c) / 2,
  },
  {
    name: 'Guard Wall',
    plan: 'Guard minions to soak up damage, with cheap cards to fill the curve',
    score: (c) => (c.mechanics.includes('BULWARK') ? 0 : 60) + c.cost * 3 - (c.health ?? 0) * 2,
  },
  {
    name: 'Spellslinger',
    plan: 'as many cheap spells as possible, with the best cheap minions to hold the board',
    score: (c) => (c.type === 'spell' ? 0 : c.type === 'item' ? 20 : 45) + c.cost * 4 - stats(c) / 4,
  },
  {
    name: 'Armed',
    plan: 'weapons and items, plus hard-hitting minions',
    score: (c) => (c.type === 'weapon' ? 0 : c.type === 'item' ? 15 : 40) + c.cost * 3 - (c.attack ?? 0) * 4,
  },
];

/** The 30 cards of a starter deck, chosen from `pool` (distinct cards, best score first). */
export const buildStarterDeck = (deck: StarterDeck, pool: Card[]): string[] => {
  const picked = [...pool].sort((a, b) => deck.score(a) - deck.score(b) || a.id.localeCompare(b.id)).slice(0, DECK_SIZE);
  return picked.map((c) => c.id);
};
