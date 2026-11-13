import mechanics from '../../data/mechanics.json';
import type { Card, RawGlossaryEntry } from './types';

export interface CardEffect {
  /** The mechanic symbol without percent signs, e.g. `BULWARK` */
  symbol: string;
  /** The display name, e.g. `Guard` */
  name: string;
  /** The glossary's full description, for a list that explains the card */
  description: string;
}

/** Tags that are bookkeeping for the card data, not something a player needs explained. */
const INTERNAL = new Set(['TARGET', 'SET_VALUE', 'EVENT', 'BOOLEAN', 'RANDOM', 'AOE', 'GLOBAL_SPELL', 'ENERGY', 'ENERGY_CRYSTAL', 'DURABILITY']);

const glossary = new Map<string, RawGlossaryEntry>();
for (const m of mechanics as unknown as RawGlossaryEntry[]) glossary.set(String(m.symbol).replace(/%/g, ''), m);

/**
 * The effects a card has, for the card detail window: each keyword or effect named in its text (in the order the text
 * names them), then its remaining tags, each with the glossary's name and description. Internal tags are left out.
 */
export const effectsOf = (card: Card): CardEffect[] => {
  const named = Array.from(card.textTemplate.matchAll(/%([A-Z_0-9]+)%/g), (m) => m[1]);
  const tagged = card.mechanics.map((s) => s.replace(/%/g, ''));
  const out: CardEffect[] = [];
  for (const symbol of [...named, ...tagged]) {
    const entry = glossary.get(symbol);
    if (!entry || INTERNAL.has(symbol) || out.some((e) => e.symbol === symbol)) continue;
    const description = typeof entry.description === 'string' ? entry.description.replace(/\{X\}/g, 'X') : '';
    if (entry.name && description) out.push({ symbol, name: String(entry.name), description });
  }
  return out;
};
