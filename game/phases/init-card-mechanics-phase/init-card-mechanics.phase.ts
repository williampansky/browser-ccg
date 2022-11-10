import { current } from 'immer';
import { Ctx, PhaseConfig } from 'boardgame.io';
import { add, subtract } from 'mathjs';
import { Card, GameState, PlayerID, Zone } from '../../../types';
import {
  createCardObject,
  drawCardFromPlayersDeck,
  getCardPower,
  logPhaseToConsole,
} from '../../../utils';
import { counts, firstRevealer } from '../../state';
import tempCardsDatabase from '../../../tempCardsDatabase';

const initCardMechanicsPhase: PhaseConfig = {
  onBegin(G, ctx) {
    logPhaseToConsole(G.turn, ctx.phase);
    const { first, second } = firstRevealer.getRevealOrder(G);

    // init mechanics
    G.zones.forEach((zone: Zone, zoneIdx: number) => {
      zone.sides[first].forEach((card: Card, cardIdx: number) => {
        if (card.revealedOnTurn === G.turn) {
          mechs(G, ctx, zoneIdx, card, cardIdx, first, zone.sides[first]);
        }
      });

      zone.sides[second].forEach((card: Card, cardIdx: number) => {
        if (card.revealedOnTurn === G.turn) {
          mechs(G, ctx, zoneIdx, card, cardIdx, second, zone.sides[second]);
        }
      });
    });

    ctx.events?.endPhase();
  },
};

function mechs(
  G: GameState,
  ctx: Ctx,
  zoneIdx: number,
  card: Card,
  cardIdx: number,
  player: PlayerID,
  zoneSide: Card[]
) {
  const {
    gameConfig,
    gameConfig: {
      numerics: { cardsPerHand },
    },
  } = G;

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

          c.displayPower = getCardPower(c);
        }
      });
      break;

    case 'CORE_003':
      if (G.players[player].cards.hand.length < cardsPerHand) {
        drawCardFromPlayersDeck(G, player, 1);
      }
      break;

    case 'CORE_004':
      if (G.players[player].cards.hand.length < cardsPerHand) {
        const randomCardBase = ctx.random!.Shuffle(tempCardsDatabase)[0];
        const randomCard = createCardObject(randomCardBase);
        G.players[player].cards.hand.push(randomCard);
        counts.incrementHand(G, player);
      }
      break;

    case 'CORE_005':
      if (zoneSide.length >= 3) {
        card.powerStream.push({
          blame: 'CORE_005',
          adjustment: 3,
          currentPower: add(card.displayPower, 3),
        });

        card.displayPower = getCardPower(card);
      }
      break;

    // @todo
    case 'CORE_006':
      /**
       * An array of all current card `uuid` values on the opponent's zones.
       */
      // let opponentCardUuidsArr: string[] = [];
      // G.zones.forEach((z) => {
      //   z.sides['1'].forEach((c) => opponentCardUuidsArr.push(c.uuid));
      // });

      // const targetUuid = ctx.random?.Shuffle(opponentCardUuidsArr)[0];
      // let targetCard: Card;
      // let targetZone: number;
      // G.zones.forEach((z, i) => {
      //   z.sides['1'].find((c: Card) => {
      //     if (c.uuid === targetUuid) {
      //       targetCard = c;
      //       targetZone = i;
      //     }
      //   });
      // })

      // // G.zones[0].sides['1'] = G.zones[0].sides['1'].splice(0, 1);
      // const newZoneSideArr = G.zones[targetZone!].sides['1'].filter((obj: Card) => obj.uuid !== targetUuid);
      // console.log(newZoneSideArr, targetZone!)
      // // G.zones[targetZone!].sides['1'] = newZoneSideArr;
      // G.zonesCardsReference['1'][targetZone!] = newZoneSideArr;
      break;

    case 'CORE_008':
      if (G.players['0'].cards.hand.length >= 1) {
        const randomCard = ctx.random?.Shuffle(G.players['0'].cards.hand)[0];
        G.players['0'].cards.hand.forEach((c) => {
          if (c.uuid === randomCard!.uuid) {
            c.currentCost = add(c.currentCost, 1);
            console.log(randomCard?.currentCost, c.currentCost)
          }
        });
      }
      break;

    default:
      break;
  }
}

export default initCardMechanicsPhase;
