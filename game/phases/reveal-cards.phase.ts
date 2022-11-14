import { Ctx, PhaseConfig } from 'boardgame.io';
import { Card, GameState, Zone, ZonesCardsReference } from '../../types';
import { revealCard } from '../moves';
import { logPhaseToConsole } from '../../utils';
import { firstRevealer } from '../state';

const revealCardsPhase: PhaseConfig = {
  onBegin(G: GameState, ctx: Ctx) {
    logPhaseToConsole(G.turn, ctx.phase);
    const { first, second } = firstRevealer.getRevealOrder(G);

    G.zonesCardsReference.forEach((z: ZonesCardsReference, zoneIdx: number) => {
      z[first].forEach((obj: Card, objIdx: number) => {
        if (!obj.revealed) revealCard(G, ctx, first, zoneIdx, obj, objIdx);
      });

      z[second].forEach((obj: Card, objIdx: number) => {
        if (!obj.revealed) revealCard(G, ctx, second, zoneIdx, obj, objIdx);
      });
    });

    ctx.events?.endPhase();
  },
};

export default revealCardsPhase;
