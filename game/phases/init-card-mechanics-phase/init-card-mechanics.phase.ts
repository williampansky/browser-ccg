import { current } from 'immer';
import { Ctx, PhaseConfig } from 'boardgame.io';
import { add, subtract } from 'mathjs';
import { Card, GameState, PlayerID, Zone } from '../../../types';
import {
  createCardObject,
  drawCardFromPlayersDeck,
  getCardPower,
  getContextualPlayerIds,
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
      numerics: { cardsPerHand, numberOfSlotsPerZone },
    },
  } = G;

  const { opponent } = getContextualPlayerIds(player);

  switch (card.id) {
    case 'CORE_002':
      G.zones[zoneIdx].sides[player].forEach((c: Card, i: number) => {
        const isNotCardPlayed = card.uuid !== c.uuid;
        const cardIsBeforeCardPlayed = cardIdx > i;

        if (isNotCardPlayed && cardIsBeforeCardPlayed) {
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
      if (G.players[opponent].cards.hand.length >= 1) {
        const rCard = ctx.random?.Shuffle(G.players[opponent].cards.hand)[0];
        G.players[opponent].cards.hand.forEach((c) => {
          if (c.uuid === rCard!.uuid) {
            c.currentCost = add(c.currentCost, 1);
          }
        });
      }
      break;

    case 'CORE_010':
      if (G.zones[zoneIdx].sides[opponent].length >= 2) {
        card.powerStream.push({
          blame: 'CORE_010',
          adjustment: 2,
          currentPower: add(card.displayPower, 2),
        });

        card.displayPower = getCardPower(card);
      }
      break;

    case 'CORE_020':
      G.zones.forEach((z, i) => {
        if (zoneIdx !== i) {
          if (z.sides[player].length < numberOfSlotsPerZone) {
            const entourageCard = createCardObject(card.entourage![0]);
            const entCardObj = { ... entourageCard, revealed: true };
            z.sides[player].push(entCardObj);
            G.zonesCardsReference[i][player].push(entCardObj);
          }
        }
      });
      break;

    default:
      break;
  }
}

export default initCardMechanicsPhase;
