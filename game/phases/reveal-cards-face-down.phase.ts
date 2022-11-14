import { Ctx, PhaseConfig } from 'boardgame.io';
import { Card, GameState, Zone, ZonesCardsReference } from '../../types';
import { revealCard } from '../moves';
import { logPhaseToConsole } from '../../utils';

const revealCardsFaceDownPhase: PhaseConfig = {
  onBegin(G: GameState, ctx: Ctx) {
    logPhaseToConsole(G.turn, ctx.phase);

    // G.ZonesCardsReference.forEach((z: ZonesCardsReference, zoneIdx: number) => {
    //   z['0'].forEach((obj: Card, objIdx: number) => {
    //     if (!obj.revealed) revealCard(G, ctx, '0', zoneIdx, obj, objIdx);
    //   });

    //   z['1'].forEach((obj: Card, objIdx: number) => {
    //     if (!obj.revealed) revealCard(G, ctx, '1', zoneIdx, obj, objIdx);
    //   });
    // });

    ctx.events?.endPhase();
  },
};

export default revealCardsFaceDownPhase;
