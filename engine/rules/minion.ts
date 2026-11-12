import type { Card, CardCatalog } from '../cards/types';
import { getCardDef } from '../definitions';
import type { CardDef, DefLookup } from '../definitions/define-card';
import type { MinionInstance, MinionKeywords } from '../state/types';

/** The behaviour a minion on the board has right now: its card's, unless it has been Suppressed. */
export const minionDef = (
  minion: MinionInstance,
  catalog: CardCatalog,
  defs: DefLookup = getCardDef
): CardDef | undefined => {
  if (minion.silenced) return undefined;
  const card = catalog.get(minion.cardId);
  return card && defs(card);
};

/** Builds a fresh minion from its card. Keyword flags come from the card's mechanics. */
export const createMinion = (card: Card, instanceId: number, turn: number, playSeq: number): MinionInstance => {
  const has = (symbol: string): boolean => card.mechanics.includes(symbol);
  const health = card.health ?? 0;
  const conditional = getCardDef(card)?.conditionalKeywords ?? [];
  const printed = (k: keyof MinionKeywords, symbol: string): boolean => has(symbol) && !conditional.includes(k);
  return {
    instanceId,
    cardId: card.id,
    attack: card.attack ?? 0,
    health,
    maxHealth: health,
    playedOnTurn: turn,
    attacksThisTurn: 0,
    playSeq,
    auraAttack: 0,
    auraRush: false,
    tempAttack: 0,
    keywords: {
      guard: printed('guard', 'BULWARK'),
      rush: printed('rush', 'RUSH'),
      bubble: printed('bubble', 'BUBBLE'),
      doubleAttack: printed('doubleAttack', 'DOUBLE_ATTACK'),
      hidden: printed('hidden', 'HIDDEN'),
      noAttack: printed('noAttack', 'NO_ATTACK'),
    },
  };
};
