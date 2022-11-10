import { current } from 'immer';
import { PhaseConfig } from 'boardgame.io';
import { add, subtract } from 'mathjs';
import { Card, GameState, PlayerID, Zone } from '../../../types';
import { getCardPower, logPhaseToConsole } from '../../../utils';
import { firstRevealer } from '../../state';

const initCardMechanicsPhase: PhaseConfig = {
  onBegin(G, ctx) {
    logPhaseToConsole(G.turn, ctx.phase);
    const { first, second } = firstRevealer.getRevealOrder(G);

    // init mechanics
    G.zones.forEach((zone: Zone, zoneIdx: number) => {
      zone.sides['0'].forEach((card: Card, cardIdx: number) => {
        if (card.revealedOnTurn === G.turn)
          mechs(G, zoneIdx, card, cardIdx, '0', zone.sides['0']);
      });
    });

    ctx.events?.endPhase();
  },
};

function mechs(
  G: GameState,
  zoneIdx: number,
  card: Card,
  cardIdx: number,
  player: PlayerID,
  zoneSide: Card[]
) {
  // switch (card.id) {
  //   case 'CORE_002':
  //     zoneSide
  //     break;
  
  //   default:
  //     break;
  // }

  // const notRevealedOnThisTurn = G.turn > card.revealedOnTurn;
  // if (notRevealedOnThisTurn) {
    switch (card.id) {
      case 'CORE_002':
        G.zones[zoneIdx].sides[player].forEach((c: Card, i: number) => {
          const isNotCardPlayed = card.uuid !== c.uuid;
  
          if (isNotCardPlayed) {
            c.powerStream.push({
              blame: 'CORE_002',
              adjustment: -1,
              currentPower: add(c.displayPower, -1),
            });
          }
        });
        break;
  
      default:
        break;
  }
}

export default initCardMechanicsPhase;
