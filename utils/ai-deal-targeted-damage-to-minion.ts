import { Ctx } from 'boardgame.io';
import { lte } from 'lodash';
import { subtract } from 'mathjs';
import { CardType } from '../enums';
import { Card, GameState, PlayerID } from '../types';
import cardUuidMatch from './card-uuid-match';
import getContextualPlayerIds from './get-contextual-player-ids';
import pushEventStreamAndSetBoolean from './push-eventstream-and-set-boolean';
import pushHealthStreamAndSetDisplay from './push-healthstream-and-set-display';

export default function aiDealTargetedDamageToMinion(
  G: GameState,
  ctx: Ctx,
  aiID: PlayerID,
  playedCard: Card,
  targetCard?: Card
) {
  const { opponent } = getContextualPlayerIds(aiID);
  let possibleTargets: {
    zoneNumber: number;
    cardData: Card;
    cardIndex: number;
  }[] = [];

  G.zones.forEach((z, zI) => {
    z.sides[opponent].forEach((c, cI) => {
      const isNotSelf = c.uuid !== playedCard.uuid;
      const isMinion = c.type === CardType.Minion;
      const isNotDestroyed = c.booleans.isDestroyed === false;
      if (isNotSelf && isMinion && isNotDestroyed)
        possibleTargets.push({
          zoneNumber: zI,
          cardData: c,
          cardIndex: cI,
        });
    });
  });

  if (possibleTargets.length !== 0) {
    const choice = ctx?.random?.Shuffle(possibleTargets)[0]!;
    G.zones.forEach((z, zI) => {
      z.sides[aiID].forEach((c) => {
        const isCardPlayed = cardUuidMatch(c, playedCard);
        if (isCardPlayed) {
          pushEventStreamAndSetBoolean(
            G,
            ctx,
            aiID,
            zI,
            c,
            choice.cardData,
            'onPlayWasTriggered'
          );
        }
      });
    });

    G.zones.forEach((z, zI) => {
      z.sides[opponent].forEach((c) => {
        const isTargetedCard = cardUuidMatch(c, choice.cardData);
        if (isTargetedCard) {
          c.booleans.hasHealthReduced = true;
          pushHealthStreamAndSetDisplay(
            c,
            playedCard,
            -playedCard.numberPrimary,
            subtract(c.displayHealth, playedCard.numberPrimary)
          );

          if (lte(subtract(c.displayHealth, playedCard.numberPrimary), 0)) {
            c.booleans.isDestroyed = true;
            c.destroyedOnTurn = G.turn;
          }
        }
      });
    });
  }
}
