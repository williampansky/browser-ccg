import type { CardCatalog } from '../../engine';

export interface DeckRow {
  id: string;
  name: string;
  cost: number;
  /** Copies the deck started with (or that were shuffled in later) */
  total: number;
  /** Copies still in the deck */
  left: number;
}

const count = (ids: string[]) => ids.reduce((m, id) => m.set(id, (m.get(id) ?? 0) + 1), new Map<string, number>());

/**
 * One row per distinct card in a deck, like a third-party Hearthstone tracker: how many copies the deck
 * started with and how many are still in it. Sorted by cost, then name. A card that is only in the
 * deck now (shuffled in mid-game) counts its current copies as its total.
 */
export const deckRows = (startIds: string[], remainingIds: string[], catalog: CardCatalog): DeckRow[] => {
  const start = count(startIds);
  const left = count(remainingIds);
  const ids = Array.from(new Set(Array.from(start.keys()).concat(Array.from(left.keys()))));
  return ids
    .map((id) => ({
      id,
      name: catalog.get(id)?.name ?? id,
      cost: catalog.get(id)?.cost ?? 0,
      total: Math.max(start.get(id) ?? 0, left.get(id) ?? 0),
      left: left.get(id) ?? 0,
    }))
    .sort((a, b) => a.cost - b.cost || a.name.localeCompare(b.name));
};
