import { add } from 'mathjs';
import type { Ctx } from 'boardgame.io';
import type { Card, GameState, PlayerID } from '../../../types';
import { pushEventStream } from '../../../utils';
import { actionPoints } from '../../state';

/**
 * +1 current AP for this turn only
 */
export const core034 = {
  exec: (
    G: GameState,
    ctx: Ctx,
    player: PlayerID,
    zoneNumber: number,
    playedCard: Card
  ) => {
    const newValue = add(G.actionPoints[player].current, 1);
    G.actionPoints[player].current = newValue;

    playedCard.booleans.onPlayWasTriggered = true;
    pushEventStream(playedCard, playedCard, 'onPlayWasTriggered');
  },
};
