import type { Ctx } from 'boardgame.io';
import type {
  Card,
  GameConfig,
  GameState,
  PlayerID,
  Zone,
} from '../../../types';
import { CardRace } from '../../../enums';
import { drawCardFromPlayersDeck } from '../../../utils';

/**
 * draw a card anytime you summon a creature
 */
export const core032 = (
  G: GameState,
  ctx: Ctx,
  gameConfig: GameConfig,
  zone: Zone,
  zoneIdx: number,
  card: Card,
  cardIdx: number,
  player: PlayerID
) => {
  G.zones.forEach((z, zIdx) => {
    z.sides[player].forEach((c, cIdx) => {
      const revealedThisTurn = c.revealedOnTurn === G.turn;
      const cardIsACreature = c.type === CardRace.Creature;
      const cardIsNotSelf = c.uuid !== card.uuid;

      if (cardIsNotSelf && cardIsACreature && revealedThisTurn) { 
        drawCardFromPlayersDeck(G, player);
        card.booleans.eventWasTriggered = true;
      }
    });
  });
};
