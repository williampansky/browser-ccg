import type { Card } from './cards/types';

import { MAX_DECK_SIZE } from './deck-rules';

export const DECK_SIZE = MAX_DECK_SIZE;

/** Which cards a starter deck is built from: CORE only, PRIME only, or both. */
export type DeckSet = 'core' | 'prime' | 'both';

export interface StarterDeck {
  name: string;
  /** The card set it draws on (default CORE) */
  set?: DeckSet;
  /** What the deck is trying to do, for the win-rate table */
  plan: string;
  /** The deck always holds at least this many minions, even if its score would prefer other cards (default 0) */
  minMinions?: number;
  /** Lower is picked first; cards are taken by ascending score, ties by id (so decks are deterministic) */
  score: (c: Card) => number;
}

const isCreature = (c: Card) => c.type === 'minion';
const stats = (c: Card) => (c.attack ?? 0) + (c.health ?? 0);
const has = (c: Card, ...tags: string[]) => tags.some((t) => c.mechanics.includes(t));
const says = (c: Card, re: RegExp) => re.test(c.text);

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
    minMinions: 12,
    plan: 'mostly spells, with 12 mid-cost minions to hold the board',
    // Centred on 2.5 mana: centred at 1 or 2 the deck lost almost every game against the others (bot-vs-bot tuning, 2026-11-12).
    score: (c) => (c.type === 'spell' ? 0 : c.type === 'item' ? 25 : 30) + Math.abs(c.cost - 2.5) * 4 - stats(c) / 2,
  },
  {
    name: 'Armed',
    minMinions: 10,
    plan: 'weapons and items, plus hard-hitting minions',
    score: (c) => (c.type === 'weapon' ? 0 : c.type === 'item' ? 15 : 40) + c.cost * 3 - (c.attack ?? 0) * 4,
  },
];

/** The deck's plan as a score the other archetypes share: how cheap and how big the card is. */
const curve = (c: Card, centre: number, weight = 4) => Math.abs(c.cost - centre) * weight - stats(c) / 3;

/** More CORE decks: each leans on a kind of card the pool has (Rush, damage, drawing, a race, removal). */
STARTER_DECKS.push(
  {
    name: 'Rush Down',
    minMinions: 14,
    plan: 'Rush and Onslaught minions that hit the turn they arrive',
    score: (c) => (has(c, 'RUSH', 'DOUBLE_ATTACK') ? 0 : 35) + c.cost * 6 - (c.attack ?? 0) * 2 + (isCreature(c) ? 0 : 15),
  },
  {
    name: 'Burn',
    minMinions: 8,
    plan: 'damage spells and damaging warcries, aimed at the enemy hero',
    score: (c) => (says(c, /damage/i) ? 0 : 50) + c.cost * 3 - (c.type === 'spell' ? 6 : 0),
  },
  {
    name: 'Card Advantage',
    minMinions: 10,
    plan: 'draw and heal your way ahead, with sturdy minions',
    score: (c) => (has(c, 'DRAW_CARD', 'HEAL', 'RESTORE_HP') ? 0 : 45) + curve(c, 3),
  },
  {
    name: 'Creature Pack',
    minMinions: 16,
    plan: 'Creatures and Sprites, a tribal board',
    score: (c) => (c.race === 'CREATURE' ? 0 : c.race === 'SPRITE' ? 8 : 40) + curve(c, 3, 3),
  },
  {
    name: 'Undead',
    minMinions: 10,
    plan: 'the Demonic (Undead) minions and what feeds on them',
    score: (c) => (c.race === 'DEMONIC' ? 0 : 40) + curve(c, 3.5, 3),
  },
  {
    name: 'Lockdown',
    minMinions: 10,
    plan: 'Disable, destroy and steal the enemy board, then win late',
    score: (c) => (has(c, 'DISABLE', 'DESTROY', 'STEAL', 'TRANSFORM') ? 0 : 50) + curve(c, 4, 2),
  }
);

/**
 * PRIME starter decks (built only from the PRIME cards the engine can play). Several lean on a whole PRIME mechanic: Mysteries,
 * Overcharge, Poison, the Sprite tribe, the big cost-reducing Giants.
 */
export const PRIME_STARTER_DECKS: StarterDeck[] = [
  {
    name: 'Mysteries',
    set: 'prime',
    minMinions: 10,
    plan: 'face-down Mysteries and the cards that feed on them',
    score: (c) => (has(c, 'MYSTERY') ? 0 : 45) + c.cost * 3 - (c.type === 'spell' ? 4 : 0),
  },
  {
    name: 'Overcharge',
    set: 'prime',
    minMinions: 10,
    plan: 'cheap, strong Overcharge cards that lock your next turn',
    score: (c) => (has(c, 'OVERLOAD') ? 0 : 45) + c.cost * 3 - (c.attack ?? 0),
  },
  {
    name: 'Sprites',
    set: 'prime',
    minMinions: 16,
    plan: 'the Sprite tribe and the Creatures that help it',
    score: (c) => (c.race === 'SPRITE' ? 0 : c.race === 'CREATURE' ? 12 : 55) + c.cost * 2 - stats(c) / 4,
  },
  {
    name: 'Giants',
    set: 'prime',
    minMinions: 14,
    plan: 'cost-reducing Giants and big bodies, stalling until they land',
    score: (c) => Math.abs(c.cost - 6) * 8 - stats(c) / 2 + (has(c, 'COST') ? -40 : 0),
  },
  {
    name: 'Assassins',
    set: 'prime',
    minMinions: 14,
    plan: 'Concealed, Poison, Rush and Onslaught minions that strike first',
    score: (c) => (has(c, 'HIDDEN', 'POISON', 'RUSH', 'DOUBLE_ATTACK') ? 0 : 45) + c.cost * 4 - (c.attack ?? 0),
  },
  {
    name: 'Spell Chain',
    set: 'prime',
    minMinions: 8,
    plan: 'cheap spells and the minions that trigger on every spell',
    score: (c) => (c.type === 'spell' ? 0 : says(c, /spell/i) ? 4 : 40) + c.cost * 3,
  },
  {
    name: 'Guardians',
    set: 'prime',
    minMinions: 14,
    plan: 'Guard minions with healing and Armor behind them',
    score: (c) => (has(c, 'BULWARK') ? 0 : has(c, 'HEAL', 'ARMOR') ? 15 : 55) + c.cost * 3 - (c.health ?? 0) * 2,
  },
  {
    name: 'Swarm',
    set: 'prime',
    minMinions: 14,
    plan: 'minions that summon more minions, wide boards',
    score: (c) => (has(c, 'SUMMON', 'ON_DEATH') ? 0 : 45) + c.cost * 3 - stats(c) / 4,
  },
  {
    name: 'Prime Aggro',
    set: 'prime',
    plan: 'cheap minions and weapons, low curve',
    score: (c) => c.cost * 10 + (isCreature(c) || c.type === 'weapon' ? 0 : 25) - (c.attack ?? 0),
  },
  {
    name: 'Prime Control',
    set: 'prime',
    plan: 'spells and expensive, high-stat minions',
    score: (c) => 100 - Math.min(c.cost, 6) * 8 - (c.type === 'spell' ? 18 : 0) - stats(c) / 2,
  },
];

/** Starter decks that mix CORE and PRIME cards. */
export const MIXED_STARTER_DECKS: StarterDeck[] = [
  {
    name: 'Mixed Aggro',
    set: 'both',
    plan: 'cheap minions and weapons from both sets',
    score: (c) => c.cost * 10 + (isCreature(c) || c.type === 'weapon' ? 0 : 25) - (c.attack ?? 0),
  },
  {
    name: 'Mixed Midrange',
    set: 'both',
    plan: 'a balanced curve around 3 to 4 mana, mostly minions',
    score: (c) => Math.abs(c.cost - 3.5) * 10 + (isCreature(c) ? 0 : 12) - stats(c) / 4,
  },
  {
    name: 'Mixed Control',
    set: 'both',
    plan: 'spells and expensive, high-stat minions',
    score: (c) => 100 - Math.min(c.cost, 6) * 8 - (c.type === 'spell' ? 18 : 0) - stats(c) / 2,
  },
  {
    name: 'Mixed Guard Wall',
    set: 'both',
    plan: 'Guard minions to soak up damage, with cheap cards to fill the curve',
    score: (c) => (c.mechanics.includes('BULWARK') ? 0 : 60) + c.cost * 3 - (c.health ?? 0) * 2,
  },
  {
    name: 'Storm',
    set: 'both',
    minMinions: 8,
    plan: 'burn and Overcharge spells, finishing with damage',
    score: (c) => (says(c, /damage/i) || has(c, 'OVERLOAD') ? 0 : 50) + c.cost * 3 - (c.type === 'spell' ? 6 : 0),
  },
  {
    name: 'Mystery Tempo',
    set: 'both',
    minMinions: 14,
    plan: 'Rush minions up front, a Mystery in the back',
    score: (c) => (has(c, 'MYSTERY') ? 0 : has(c, 'RUSH', 'DOUBLE_ATTACK') ? 6 : 45) + c.cost * 4 - (c.attack ?? 0),
  },
  {
    name: 'Poison Wall',
    set: 'both',
    minMinions: 14,
    plan: 'Guard minions with Touch of Death behind them',
    score: (c) => (has(c, 'POISON') ? 0 : has(c, 'BULWARK') ? 8 : 55) + c.cost * 3 - (c.health ?? 0),
  },
  {
    name: 'Tribal Mix',
    set: 'both',
    minMinions: 16,
    plan: 'Sprites, Creatures and Undead from both sets, the cheapest first',
    score: (c) => (c.race === 'SPRITE' ? 0 : c.race === 'CREATURE' ? 4 : c.race === 'DEMONIC' ? 8 : 55) + c.cost * 2 - stats(c) / 4,
  },
];

/** Every starter deck, whatever its set. */
export const ALL_STARTER_DECKS: StarterDeck[] = [...STARTER_DECKS, ...PRIME_STARTER_DECKS, ...MIXED_STARTER_DECKS];

/** The cards a deck of this set is built from. */
export const poolFor = (set: DeckSet | undefined, core: Card[], prime: Card[]): Card[] =>
  set === 'prime' ? prime : set === 'both' ? [...core, ...prime] : core;

/**
 * The 30 cards of a starter deck, chosen from `pool` (distinct cards, best score first). If the deck has `minMinions`, its
 * best-scoring minions are taken first and the rest of the deck is filled by score from everything else.
 */
export const buildStarterDeck = (deck: StarterDeck, pool: Card[]): string[] => {
  const ranked = [...pool].sort((a, b) => deck.score(a) - deck.score(b) || a.id.localeCompare(b.id));
  const minions = ranked.filter(isCreature).slice(0, deck.minMinions ?? 0);
  const picked = [...minions, ...ranked.filter((c) => !minions.includes(c))].slice(0, DECK_SIZE);
  return picked.map((c) => c.id);
};
