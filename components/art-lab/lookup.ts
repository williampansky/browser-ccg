export interface LookupCard {
  id: string;
  name?: string;
  set?: string;
  active?: boolean;
}

/** Cards matching what was typed: an exact id wins, then exact name, then anything whose id or name contains it (case-insensitive). */
export const findCards = (query: string, cards: LookupCard[], limit = 12): LookupCard[] => {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const exactId = cards.filter((c) => c.id.toLowerCase() === q);
  if (exactId.length) return exactId;
  const exactName = cards.filter((c) => c.name?.toLowerCase() === q);
  if (exactName.length) return exactName;
  return cards.filter((c) => c.id.toLowerCase().includes(q) || c.name?.toLowerCase().includes(q)).slice(0, limit);
};
