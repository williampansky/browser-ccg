import type { Ctx } from 'boardgame.io';
import type {
  Card,
  GameConfig,
  GameState,
  PlayerID,
  Zone,
} from '../../../types';
import { CardType } from '../../../enums';
import { handleCardDestructionMechanics } from '../../../utils';
import { counts } from '../../state';

/**
 * destroy random enemy minion
 */
export const core041 = (
  G: GameState,
  ctx: Ctx,
  gameConfig: GameConfig,
  zone: Zone,
  zoneIdx: number,
  card: Card,
  cardIdx: number,
  player: PlayerID,
  opponent: PlayerID
) => {
  let possibleTargets: {
    zoneNumber: number;
    cardData: Card;
    cardIndex: number;
  }[] = [];

  G.zones.forEach((z, zIdx) => {
    z.sides[opponent].forEach((c, cIdx) => {
      // make sure race matches
      if (c.type === CardType.Minion) {
        possibleTargets.push({
          zoneNumber: zIdx,
          cardData: c,
          cardIndex: cIdx,
        });
      }
    });
  });

  // if there is a target
  if (possibleTargets.length !== 0) {
    // get a random one from the list
    const choice = ctx?.random?.Shuffle(possibleTargets)[0]!;

    // push to opponents destroyed arr
    G.players[opponent].cards.destroyed.push(choice.cardData);
    counts.incrementDestroyed(G, opponent);

    // remove the target from the board zone side and its ref
    const newZoneArr = G.zones[choice.zoneNumber].sides[opponent].filter(
      (c) => {
        return c.uuid !== choice.cardData.uuid;
      }
    );

    G.zones[choice.zoneNumber].sides[opponent] = newZoneArr;
    handleCardDestructionMechanics(G, choice.cardData, opponent);
    card.booleans.onPlayWasTriggered = true;
  }
};
