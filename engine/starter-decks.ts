/**
 * The starter decks: what a new player plays before collecting anything.
 * Every deck is two copies of five class cards (the class's starter cards,
 * none of them a Mystery or Mythic) and two copies of the same ten neutral
 * Core cards, thirty cards in all.
 */

const COPIES_PER_CARD = 2;

/** The neutral Core cards every starter deck shares, one entry per card. */
export const STARTER_NEUTRAL_IDS: string[] = [
  'CORE_004',
  'CORE_008',
  'CORE_010',
  'CORE_017',
  'CORE_020',
  'CORE_023',
  'CORE_029',
  'CORE_026',
  'CORE_035',
  'CORE_038',
];

/** The five class cards of each class's starter deck, by class key. */
export const STARTER_CLASS_IDS: Record<string, string[]> = {
  FIGHTER: ['PRIME_235', 'PRIME_236', 'PRIME_239', 'PRIME_261', 'PRIME_255'],
  WIZARD: ['PRIME_151', 'PRIME_274', 'PRIME_279', 'PRIME_275', 'PRIME_145'],
  RANGER: ['PRIME_277', 'PRIME_276', 'PRIME_278', 'PRIME_130', 'PRIME_131'],
  CLERIC: ['PRIME_171', 'PRIME_176', 'PRIME_173', 'PRIME_172', 'PRIME_175'],
  CRUSADER: ['PRIME_160', 'PRIME_166', 'PRIME_264', 'PRIME_163', 'PRIME_165'],
  ASSASSIN: ['PRIME_265', 'PRIME_189', 'PRIME_193', 'PRIME_188', 'PRIME_192'],
  MYSTIC: ['PRIME_204', 'PRIME_207', 'PRIME_203', 'PRIME_259', 'PRIME_260'],
  NECROMANCER: [
    'PRIME_269',
    'PRIME_216',
    'PRIME_219',
    'PRIME_226',
    'PRIME_218',
  ],
  WARDEN: ['PRIME_113', 'PRIME_111', 'PRIME_118', 'PRIME_119', 'PRIME_120'],
};

/** The thirty-card starter deck for a class key (empty for an unknown one). */
export const starterDeck = (classKey: string): string[] => {
  const classIds = STARTER_CLASS_IDS[classKey];
  if (!classIds) return [];

  return [...classIds, ...STARTER_NEUTRAL_IDS].flatMap((id) =>
    Array.from({ length: COPIES_PER_CARD }, () => id),
  );
};
