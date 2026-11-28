import starterEntries from '../data/starter-decks.json';

/**
 * The starter decks: what a new player plays before collecting anything.
 * They come from the Airtable STARTER DECKS table (`data/starter-decks.json`,
 * one row per card with its class and copies), thirty cards a deck. Some
 * picks may not have availability STARTER; that is fine.
 */

/**
 * Snapshot of the hand-picked starter decks as of 2026-11-27, before the
 * Airtable STARTER DECKS table took over (CORE / PRIME numbers; two copies of
 * each):
 *
 * FIGHTER: PRIME 235, 236, 239, 261, 255;
 *   CORE 004, 005, 009, 010, 016, 019, 023, 025, 035, 038
 * WIZARD: PRIME 151, 274, 279, 273, 145;
 *   CORE 001, 004, 008, 013, 014, 017, 024, 026, 029, 038
 * RANGER: PRIME 277, 276, 278, 130, 131;
 *   CORE 005, 008, 014, 016, 017, 020, 027, 031, 040, 061
 * CLERIC: PRIME 171, 176, 173, 172, 175;
 *   CORE 002, 006, 011, 013, 015, 021, 024, 026, 032, 034
 * CRUSADER: PRIME 160, 166, 264, 162, 165;
 *   CORE 002, 005, 009, 010, 016, 019, 025, 030, 033, 042
 * ASSASSIN: PRIME 265, 189, 193, 188, 192;
 *   CORE 001, 002, 010, 013, 016, 025, 026, 030, 035, 131
 * MYSTIC: PRIME 204, 207, 203, 259, 260;
 *   CORE 004, 006, 010, 013, 019, 020, 029, 032, 033, 042
 * NECROMANCER: PRIME 269, 216, 219, 224, 217;
 *   CORE 001, 004, 006, 008, 014, 015, 017, 028, 032, 042
 * WARDEN: PRIME 113, 111, 112, 121, 120;
 *   CORE 001, 008, 010, 014, 017, 021, 024, 029, 032, 039
 */

type StarterEntry = { class: string; card: string; copies: number };

const CLASS_PREFIX = 'CLASS_';

/** The thirty-card starter deck for a class key (empty for an unknown one). */
export const starterDeck = (classKey: string): string[] => {
  const entries = starterEntries as StarterEntry[];

  return entries
    .filter((entry) => entry.class.replace(CLASS_PREFIX, '') === classKey)
    .flatMap((entry) => Array.from({ length: entry.copies }, () => entry.card));
};
