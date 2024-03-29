import { add } from 'mathjs';
import type { Ctx } from 'boardgame.io';
import type { Card, GameState, PlayerID } from '../../../types';
import { pushEventStream, pushEventStreamAndSetBoolean } from '../../../utils';
import { actionPoints } from '../../state';

/**
 * get 1 additional energy slot
 */
const core037 = {
  exec: (
    G: GameState,
    ctx: Ctx,
    player: PlayerID,
    zoneNumber: number,
    playedCard: Card
  ) => {
    const { numberPrimary } = playedCard;
    const currentTotal = G.actionPoints[player].total;
    const newTotal = add(currentTotal, numberPrimary);

    actionPoints.setTotal(G, player, newTotal);

    pushEventStreamAndSetBoolean(
      G,
      ctx,
      player,
      zoneNumber,
      playedCard,
      playedCard,
      'onPlayWasTriggered'
    );
  },
};

export default core037;
