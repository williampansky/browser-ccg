import { current } from 'immer';
import type {
  Card,
  GameConfig,
  GameState,
  PlayerID,
  Zone,
} from '../../../types';
import type { CtxWithEffects } from '../../game';
import { handleCardDestructionMechanics } from '../../../utils';

/**
 * destroy a random 1 cost on opponent's side
 */
export const core006 = (
  G: GameState,
  ctx: CtxWithEffects,
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
        cardIndex: cIdx,
      });
    }
  });

  // if there is a target
  if (possibleTargets.length !== 0) {
    // get a random one from the list
    const choice = ctx?.random?.Shuffle(possibleTargets)[0]!;

    // push to opponents destroyed arr
    G.players[opponent].cards.destroyed.push(choice.cardData.key);

    // remove the target from the board zone side and its ref
    const newZoneArr = G.zones[choice.zoneNumber].sides[opponent].filter(
      (c) => {
        return c.uuid !== choice.cardData.uuid;
      }
    );

    G.zones[choice.zoneNumber].sides[opponent] = newZoneArr;
    G.zonesCardsReference[choice.zoneNumber][opponent] = newZoneArr;
    handleCardDestructionMechanics(G, choice.cardData, opponent);
    ctx.effects.effectsEnd();
  }
};
