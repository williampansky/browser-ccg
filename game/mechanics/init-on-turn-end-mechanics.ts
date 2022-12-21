import type { Ctx } from 'boardgame.io';
import type { Card, GameState, PlayerID, Zone } from '../../types';
import core013 from './core-mechanics-by-key/mechanic.core.013';

const initOnTurnEndMechanics = (
  G: GameState,
  ctx: Ctx,
  zone: Zone,
  zoneIdx: number,
  card: Card,
  cardIdx: number,
  player: PlayerID
) => {
  if (!card) return;

  switch (card?.key) {
    case 'SET_CORE_013':
      core013.exec(G, ctx, zone, zoneIdx, card, cardIdx, player);
      break;
  }
};

export default initOnTurnEndMechanics;
