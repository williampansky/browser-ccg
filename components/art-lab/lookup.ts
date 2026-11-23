export interface LookupCard {
  id: string;
  name?: string;
  set?: string;
  active?: boolean;
}

/**
 * A card id in its one true spelling: set and number in capitals, an entourage letter in lower case (`core_020A` -> `CORE_020a`). The data, Airtable
 * and the art file names all spell it that way, so an id typed or put in a URL has to be fixed up before it is looked up (a blanket upper-casing
 * turned `CORE_020a` into `CORE_020A`, which matches nothing).
 */
export const canonicalCardId = (id: string): string => {
  const m = /^([A-Za-z]+)_(\d+)([A-Za-z]*)$/.exec(id.trim());
  return m
    ? `${m[1].toUpperCase()}_${m[2]}${m[3].toLowerCase()}`
    : id.trim().toUpperCase();
};

/** Cards matching what was typed: an exact id wins, then exact name, then anything whose id or name contains it (case-insensitive). */
export const findCards = (
  query: string,
  cards: LookupCard[],
  limit = 12,
): LookupCard[] => {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const exactId = cards.filter((c) => c.id.toLowerCase() === q);
  if (exactId.length) return exactId;
  const exactName = cards.filter((c) => c.name?.toLowerCase() === q);
  if (exactName.length) return exactName;
  return cards
    .filter(
      (c) =>
        c.id.toLowerCase().includes(q) || c.name?.toLowerCase().includes(q),
    )
    .slice(0, limit);
};
