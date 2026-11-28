/**
 * The starter decks: what a new player plays before collecting anything.
 * Every deck is two copies of five class cards (the class's starter cards,
 * none of them a Mystery or Mythic) and two copies of ten neutral Core cards
 * chosen for that class, thirty cards in all.
 */

const COPIES_PER_CARD = 2;

/**
 * The ten neutral Core cards of each class's starter deck, by class key. They
 * differ per class (a defensive class gets sturdier bodies, an aggressive one
 * cheap fast ones), with some overlap.
 */
export const STARTER_NEUTRAL_IDS: Record<string, string[]> = {
  FIGHTER: [
    'CORE_004',
    'CORE_005',
    'CORE_009',
    'CORE_010',
    'CORE_016',
    'CORE_019',
    'CORE_023',
    'CORE_025',
    'CORE_035',
    'CORE_038',
  ],
  WIZARD: [
    'CORE_001',
    'CORE_004',
    'CORE_008',
    'CORE_013',
    'CORE_014',
    'CORE_017',
    'CORE_024',
    'CORE_026',
    'CORE_029',
    'CORE_038',
  ],
  RANGER: [
    'CORE_005',
    'CORE_008',
    'CORE_014',
    'CORE_016',
    'CORE_017',
    'CORE_020',
    'CORE_027',
    'CORE_031',
    'CORE_040',
    'CORE_061',
  ],
  CLERIC: [
    'CORE_002',
    'CORE_006',
    'CORE_011',
    'CORE_013',
    'CORE_015',
    'CORE_021',
    'CORE_024',
    'CORE_026',
    'CORE_032',
    'CORE_034',
  ],
  CRUSADER: [
    'CORE_002',
    'CORE_005',
    'CORE_009',
    'CORE_010',
    'CORE_016',
    'CORE_019',
    'CORE_025',
    'CORE_030',
    'CORE_033',
    'CORE_042',
  ],
  ASSASSIN: [
    'CORE_001',
    'CORE_002',
    'CORE_010',
    'CORE_013',
    'CORE_016',
    'CORE_025',
    'CORE_026',
    'CORE_030',
    'CORE_035',
    'CORE_131',
  ],
  MYSTIC: [
    'CORE_004',
    'CORE_006',
    'CORE_010',
    'CORE_013',
    'CORE_019',
    'CORE_020',
    'CORE_029',
    'CORE_032',
    'CORE_033',
    'CORE_042',
  ],
  NECROMANCER: [
    'CORE_001',
    'CORE_004',
    'CORE_006',
    'CORE_008',
    'CORE_014',
    'CORE_015',
    'CORE_017',
    'CORE_028',
    'CORE_032',
    'CORE_042',
  ],
  WARDEN: [
    'CORE_001',
    'CORE_008',
    'CORE_010',
    'CORE_014',
    'CORE_017',
    'CORE_021',
    'CORE_024',
    'CORE_029',
    'CORE_032',
    'CORE_039',
  ],
};

/** The five class cards of each class's starter deck, by class key. */
export const STARTER_CLASS_IDS: Record<string, string[]> = {
  FIGHTER: ['PRIME_235', 'PRIME_236', 'PRIME_239', 'PRIME_261', 'PRIME_255'],
  WIZARD: ['PRIME_151', 'PRIME_274', 'PRIME_279', 'PRIME_273', 'PRIME_145'],
  RANGER: ['PRIME_277', 'PRIME_276', 'PRIME_278', 'PRIME_130', 'PRIME_131'],
  CLERIC: ['PRIME_171', 'PRIME_176', 'PRIME_173', 'PRIME_172', 'PRIME_175'],
  CRUSADER: ['PRIME_160', 'PRIME_166', 'PRIME_264', 'PRIME_162', 'PRIME_165'],
  ASSASSIN: ['PRIME_265', 'PRIME_189', 'PRIME_193', 'PRIME_188', 'PRIME_192'],
  MYSTIC: ['PRIME_204', 'PRIME_207', 'PRIME_203', 'PRIME_259', 'PRIME_260'],
  NECROMANCER: [
    'PRIME_269',
    'PRIME_216',
    'PRIME_219',
    'PRIME_224',
    'PRIME_217',
  ],
  WARDEN: ['PRIME_113', 'PRIME_111', 'PRIME_112', 'PRIME_121', 'PRIME_120'],
};

/** The thirty-card starter deck for a class key (empty for an unknown one). */
export const starterDeck = (classKey: string): string[] => {
  const classIds = STARTER_CLASS_IDS[classKey];
  if (!classIds) return [];

  return [...classIds, ...STARTER_NEUTRAL_IDS[classKey]].flatMap((id) =>
    Array.from({ length: COPIES_PER_CARD }, () => id),
  );
};
