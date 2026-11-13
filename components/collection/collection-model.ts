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

/** Dev-only art checks: `missing` = no `-CARD` file on disk, `fpo` / `final` = the Airtable `artStatus`, `untracked` = no status yet. */
export const ART_FILTERS = [
  { id: 'all', label: 'Any art' },
  { id: 'missing', label: 'No art file' },
  { id: 'fpo', label: 'FPO art' },
  { id: 'untracked', label: 'No art status' },
  { id: 'final', label: 'Final art' },
] as const;
export type ArtFilter = typeof ART_FILTERS[number]['id'];

export const matchesArt = (c: Card, mode: ArtFilter, missing: ReadonlySet<string>): boolean => {
  if (mode === 'all') return true;
  if (mode === 'missing') return missing.has(c.id);
  if (mode === 'untracked') return !c.artStatus;
  return c.artStatus === mode.toUpperCase();
};

const PARAM = { search: 'q', set: 'set', type: 'type', cost: 'cost', rarity: 'rarity', race: 'race', effect: 'effect' } as const;
const one = (v: string | string[] | undefined): string | undefined => (Array.isArray(v) ? v[0] : v);

/** The filters as URL params: only those that differ from the default, so an unfiltered page has a clean URL. */
export const toQuery = (f: CollectionFilters, sort: SortKey, art: ArtFilter, tokens = false): Record<string, string> => {
  const q: Record<string, string> = {};
  for (const k of Object.keys(PARAM) as (keyof typeof PARAM)[]) if (f[k] !== DEFAULT_FILTERS[k]) q[PARAM[k]] = f[k];
  if (sort !== 'cost') q.sort = sort;
  if (art !== 'all') q.art = art;
  if (tokens) q.tokens = '1';
  return q;
};

/** The reverse; a value that is not valid for its filter (a hand-edited URL) falls back to the default. */
export const fromQuery = (query: Record<string, string | string[] | undefined>): { filters: CollectionFilters; sort: SortKey; art: ArtFilter; tokens: boolean } => {
  const pick = <T extends string>(v: string | undefined, allowed: readonly T[], fallback: T): T => (allowed as readonly string[]).includes(v ?? '') ? (v as T) : fallback;
  const text = (k: keyof typeof PARAM) => one(query[PARAM[k]]) ?? DEFAULT_FILTERS[k];
  return {
    filters: {
      search: text('search'),
      set: pick(text('set'), SETS, DEFAULT_FILTERS.set),
      type: pick(text('type'), TYPES, DEFAULT_FILTERS.type),
      cost: pick(text('cost'), COSTS, DEFAULT_FILTERS.cost),
      rarity: text('rarity'),
      race: text('race'),
      effect: text('effect'),
    },
    sort: pick(one(query.sort), SORTS.map((s) => s.id), 'cost'),
    art: pick(one(query.art), ART_FILTERS.map((a) => a.id), 'all'),
    tokens: one(query.tokens) === '1',
  };
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
