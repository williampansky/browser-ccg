import { effectsOf } from '../../engine';
import type { Card } from '../../engine';

export const COSTS = ['all', '0', '1', '2', '3', '4', '5', '6', '7+'] as const;
export const TYPES = ['all', 'minion', 'spell', 'weapon', 'item'] as const;
export const SETS = ['both', 'core', 'prime'] as const;

/** Rarities from lowest to highest, with the name players see (the same order as `RARITY_STYLE`). */
export const RARITIES = [
  { id: 'FREE', label: 'Free' },
  { id: 'COMMON', label: 'Common' },
  { id: 'SUPERIOR', label: 'Superior' },
  { id: 'REMARKABLE', label: 'Remarkable' },
  { id: 'MYTHIC', label: 'Mythic' },
] as const;

export interface CollectionFilters {
  search: string;
  set: typeof SETS[number];
  type: typeof TYPES[number];
  cost: typeof COSTS[number];
  /** `all`, or a rarity id */
  rarity: string;
  /** `all`, or a race id (`CREATURE`); minions only */
  race: string;
  /** `all`, or a mechanic symbol (`RUSH`) */
  effect: string;
}

export const DEFAULT_FILTERS: CollectionFilters = { search: '', set: 'both', type: 'all', cost: 'all', rarity: 'all', race: 'all', effect: 'all' };

export const isFiltered = (f: CollectionFilters): boolean => (Object.keys(DEFAULT_FILTERS) as (keyof CollectionFilters)[]).some((k) => f[k] !== DEFAULT_FILTERS[k]);

export const filterCards = (cards: readonly Card[], f: CollectionFilters): Card[] => {
  const q = f.search.trim().toLowerCase();
  return cards.filter((c) => {
    if (f.set !== 'both' && c.source !== f.set) return false;
    if (f.type !== 'all' && c.type !== f.type) return false;
    if (f.cost !== 'all' && (f.cost === '7+' ? c.cost < 7 : c.cost !== Number(f.cost))) return false;
    if (f.rarity !== 'all' && c.rarity !== f.rarity) return false;
    if (f.race !== 'all' && !(c.type === 'minion' && c.race === f.race)) return false;
    if (f.effect !== 'all' && !effectsOf(c).some((e) => e.symbol === f.effect)) return false;
    return !q || (c.name ?? '').toLowerCase().includes(q) || c.text.toLowerCase().includes(q);
  });
};

export interface Option {
  value: string;
  label: string;
}

/** Every effect some card has, once each, by display name. */
export const effectOptions = (cards: readonly Card[]): Option[] => {
  const seen = new Map<string, string>();
  for (const c of cards) for (const e of effectsOf(c)) seen.set(e.symbol, e.name);
  return Array.from(seen, ([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label));
};

/** Every minion race in the pool, once each, by display name. */
export const raceOptions = (cards: readonly Card[]): Option[] => {
  const seen = new Map<string, string>();
  for (const c of cards) if (c.type === 'minion' && c.race && c.race !== 'NONE') seen.set(c.race, c.raceName ?? c.race);
  return Array.from(seen, ([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label));
};

export const SORTS = [
  { id: 'cost', label: 'Cost' },
  { id: 'name', label: 'Name' },
  { id: 'rarity', label: 'Rarity' },
  { id: 'attack', label: 'Attack' },
  { id: 'health', label: 'Health' },
] as const;
export type SortKey = typeof SORTS[number]['id'];

const byName = (a: Card, b: Card) => (a.name ?? '').localeCompare(b.name ?? '');

/** A sorted copy. Cost, name and rarity go low to high; attack and health go high to low, with cards that have none last. Ties fall back to cost, then name. */
export const sortCards = (cards: readonly Card[], key: SortKey): Card[] => {
  const rank = (c: Card) => RARITIES.findIndex((r) => r.id === c.rarity);
  const stat = (c: Card) => (key === 'attack' ? c.attack : c.health);
  const primary = (a: Card, b: Card): number => {
    if (key === 'name') return byName(a, b);
    if (key === 'rarity') return rank(a) - rank(b);
    if (key === 'attack' || key === 'health') {
      const [x, y] = [stat(a), stat(b)];
      return x === undefined || y === undefined ? (x === undefined ? 1 : 0) - (y === undefined ? 1 : 0) : y - x;
    }
    return a.cost - b.cost;
  };
  return [...cards].sort((a, b) => primary(a, b) || a.cost - b.cost || byName(a, b));
};

/** Card widths for the grid, in px. */
export const SIZES = [
  { id: 'small', label: 'S', width: 100 },
  { id: 'medium', label: 'M', width: 150 },
  { id: 'large', label: 'L', width: 210 },
  { id: 'xlarge', label: 'XL', width: 280 },
] as const;
export type SizeId = typeof SIZES[number]['id'];

export const sizeOf = (id: unknown) => SIZES.find((s) => s.id === id) ?? SIZES[1];

const KEY = 'ccg.collection.v1';

/** The grid size chosen last time in this browser (medium when there is none, or the stored value is junk). */
export const loadSize = (): SizeId => {
  try {
    return sizeOf(JSON.parse(window.localStorage.getItem(KEY) ?? '{}')?.size).id;
  } catch {
    return 'medium';
  }
};

export const saveSize = (size: SizeId): void => {
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ size }));
  } catch {
    /* storage blocked: the size just lasts this page view */
  }
};
