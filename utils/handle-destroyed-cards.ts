import { lte } from 'lodash';
import { Ctx } from 'boardgame.io';
import { Card, GameState, PlayerID } from '../types';
import { handleCardDestructionMechanics } from '../utils';
import { counts } from '../game/state';

export default function handleDestroyedCards(G: GameState, ctx: Ctx) {
  // handle card deaths if health goes below zero
  const init = (G: GameState, c: Card, player: PlayerID) => {
    const destroyedThisTurn = c.destroyedOnTurn === G.turn;
    const hpIsLessOrEqualTo = (n: number) => lte(c.displayHealth, n);
    const shouldInit = () => {
      return (hpIsLessOrEqualTo(0) && destroyedThisTurn) || destroyedThisTurn;
    };

    if (shouldInit()) {
      if (!c.booleans.isDestroyed) c.booleans.isDestroyed = true;
      G.players[player].cards.destroyed.push(c);
      counts.incrementDestroyed(G, player);
      handleCardDestructionMechanics(G, c, player);
    }
  };

  G.zones.forEach((zone, zoneIdx) => {
    zone.sides['0'].forEach((c, cI) => init(G, c, '0'));
    zone.sides['1'].forEach((c, cI) => init(G, c, '1'));
  });
}
