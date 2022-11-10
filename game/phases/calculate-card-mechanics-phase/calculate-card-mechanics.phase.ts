import { current } from 'immer';
import { PhaseConfig } from 'boardgame.io';
import { add, subtract } from 'mathjs';
import { Card, GameState, PlayerID, Zone } from '../../../types';
import { getCardPower, logPhaseToConsole } from '../../../utils';
import { firstRevealer } from '../../state';

const calculateCardMechanicsPhase: PhaseConfig = {
  onBegin(G, ctx) {
    logPhaseToConsole(G.turn, ctx.phase);
    const { first, second } = firstRevealer.getRevealOrder(G);

    G.zones.forEach((zone: Zone, zoneIdx: number) => {
      zone.sides['0'].forEach((card: Card, cardIdx: number) => {
        if (cardIdx < zone.sides['0'].length - 1) {
          card.displayPower = getCardPower(card); 
        }
      });
    });

    console.table(current(G.zones[0].sides['0']));
    ctx.events?.endPhase();
  },
};

export default calculateCardMechanicsPhase;
