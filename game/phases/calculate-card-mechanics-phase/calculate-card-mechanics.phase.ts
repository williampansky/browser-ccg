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

    // G.zones.forEach((zone: Zone, zoneIdx: number) => {
    //   zone.sides[first].forEach((card: Card, cardIdx: number) => {
    //     if (cardIdx < zone.sides[first].length - 1) {
    //       card.displayPower = getCardPower(card);
    //     }
    //   });

    //   zone.sides[second].forEach((card: Card, cardIdx: number) => {
    //     if (cardIdx < zone.sides[second].length - 1) {
    //       card.displayPower = getCardPower(card);
    //     }
    //   });
    // });

    ctx.events?.endPhase();
  },
};

export default calculateCardMechanicsPhase;
