import { current } from 'immer';
import type { Ctx } from 'boardgame.io';
import type {
  Card,
  GameConfig,
  GameState,
  PlayerID,
  Zone,
} from '../../../types';

/**
 * destroy a random 1 cost on opponent's side
 */
export const core006 = (
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
  const { numberPrimary } = card;
  let possibleTargets: {
    zoneNumber: number;
    cardData: Card;
    cardIndex: number;
  }[] = [];

  zone.sides[opponent].forEach((c, cIdx) => {
    if (c.baseCost === numberPrimary) {
      possibleTargets.push({
        zoneNumber: zoneIdx,
        cardData: c,
        cardIndex: cIdx
      });
    }
  });

  // if there is a target
  if (possibleTargets.length !== 0) {
    // get a random one from the list
    const choice = ctx?.random?.Shuffle(possibleTargets)[0]!;

    // remove the target from the board zone side and its ref
    // const node = G.zones[choice.zoneNumber].sides[opponent][choice.cardIndex];
    const newZoneArr = G.zones[choice.zoneNumber].sides[opponent].filter(c => {
      return c.uuid !== choice.cardData.uuid;
    })

    G.zones[choice.zoneNumber].sides[opponent] = newZoneArr;
    G.zonesCardsReference[choice.zoneNumber][opponent] = newZoneArr;
  }
};
