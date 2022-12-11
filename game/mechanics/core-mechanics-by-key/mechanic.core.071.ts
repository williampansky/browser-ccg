import type { Ctx } from 'boardgame.io';
import type { Card, GameState, PlayerID } from '../../../types';
import { getContextualPlayerIds, pushEventStream } from '../../../utils';

/**
 * disable opponent's zone for 1 turn
 */
const core071 = {
  exec: (
    G: GameState,
    ctx: Ctx,
    player: PlayerID,
    zoneNumber: number,
    playedCard: Card
  ) => {
    const { numberPrimary } = playedCard;
    const { opponent } = getContextualPlayerIds(player);

    playedCard.booleans.onPlayWasTriggered = true;
    pushEventStream(playedCard, playedCard, 'onPlayWasTriggered');

    G.zones[zoneNumber].disabled[opponent] = true;
    G.zones[zoneNumber].disabledForXTurns[opponent] = numberPrimary;
  },
};

export default core071;
