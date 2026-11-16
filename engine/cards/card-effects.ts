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

const glossary = new Map<string, RawGlossaryEntry>();
for (const m of mechanics as unknown as RawGlossaryEntry[]) glossary.set(String(m.symbol).replace(/%/g, ''), m);

/**
 * The effects a card has, for the card detail window: exactly the entries in its Airtable `mechanics` array, in that order, each with the
 * glossary's name and description. Nothing is hidden (the window is the deep look at a card) and nothing is added from the card text, so
 * a keyword the text names but the array lacks is not listed: fix the array in Airtable.
 */
export const effectsOf = (card: Card): CardEffect[] => {
  const out: CardEffect[] = [];
  for (const tag of card.mechanics) {
    const symbol = tag.replace(/%/g, '');
    const entry = glossary.get(symbol);
    if (!entry || out.some((e) => e.symbol === symbol)) continue;
    const description = typeof entry.description === 'string' ? entry.description.replace(/\{X\}/g, 'X') : '';
    if (entry.name && description) out.push({ symbol, name: String(entry.name), description });
  }
  return out;
};
