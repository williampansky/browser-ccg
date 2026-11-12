import type { Card, CardCatalog } from '../cards/types';
import { getCardDef } from '../definitions';
import type { CardDef, DefLookup } from '../definitions/define-card';
import type { MinionInstance } from '../state/types';

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
      guard: has('BULWARK'),
      rush: has('RUSH'),
      bubble: has('BUBBLE'),
      doubleAttack: has('DOUBLE_ATTACK'),
      hidden: has('HIDDEN'),
      noAttack: has('NO_ATTACK'),
    },
  };
};
