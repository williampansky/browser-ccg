import type { Ctx } from 'boardgame.io';
import type { Card, CardBase, GameState, PlayerID } from '../../../types';
import { createCardObject, pushEventStream } from '../../../utils';
import setsEntourage from '../../data/setsEntourage.json';

/**
 * on play: summon 2/1 droid companion
 */
const core025 = {
  exec: (
    G: GameState,
    ctx: Ctx,
    player: PlayerID,
    zoneNumber: number,
    playedCard: Card
  ) => {
    const {
      numerics: { numberOfSlotsPerZone },
    } = G.gameConfig;

    if (G.zones[zoneNumber].sides[player].length < numberOfSlotsPerZone) {
      const entArr = setsEntourage.filter((ent: CardBase) => {
        const set = ent.set.replace(/\%/g, '');
        const id = playedCard.id;
        return ent.key!.includes(`${set}_${id}`);
      });

      const entObj = entArr[0];
      const entourageCard = createCardObject(entObj);
      const entCardObj = { ...entourageCard, revealed: true };

      G.zones[zoneNumber].sides[player].push(entCardObj);

      playedCard.booleans.onPlayWasTriggered = true;
      pushEventStream(playedCard, playedCard, 'onPlayWasTriggered');
    }
  },
};

export default core025;
