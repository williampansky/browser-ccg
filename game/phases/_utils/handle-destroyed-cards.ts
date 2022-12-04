import { lte } from 'lodash';
import { Ctx } from 'boardgame.io';
import { counts } from '../../state';
import { GameState } from '../../../types';
import { handleCardDestructionMechanics } from '../../../utils';

export default function handleDestroyedCards(G: GameState, ctx: Ctx) {
  G.zones.forEach((zone, zoneIdx) => {
    // handle card deaths if health goes below zero
    zone.sides['0'].forEach((c, cI) => {
      const hpIsLessOrEqualTo = (n: number) => lte(c.displayHealth, n);
      if (hpIsLessOrEqualTo(0)) {
        c.booleans.isDestroyed = true;
        G.players['0'].cards.destroyed.push(c);
        counts.incrementDestroyed(G, '0');
        handleCardDestructionMechanics(G, c, '0');
      }
    });

    // handle card deaths if health goes below zero
    zone.sides['1'].forEach((c, cI) => {
      const hpIsLessOrEqualTo = (n: number) => lte(c.displayHealth, n);
      if (hpIsLessOrEqualTo(0)) {
        c.booleans.isDestroyed = true;
        G.players['1'].cards.destroyed.push(c);
        counts.incrementDestroyed(G, '1');
        handleCardDestructionMechanics(G, c, '1');
      }
    });
  });
}
