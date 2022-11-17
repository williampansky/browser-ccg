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
import setsCore from '../../data/setsCore.json';
import setsEntourage from '../../data/setsEntourage.json';
import { initCardMechanicsByKey } from '../../mechanics';

const initCardMechanicsPhase: PhaseConfig = {
  onBegin(G, ctx) {
    logPhaseToConsole(G.turn, ctx.phase);
    const { first, second } = firstRevealer.getRevealOrder(G);
    const fir = first;
    const sec = second;

    G.zones.forEach((zone: Zone, zoneIdx: number) => {
      zone.sides[fir].forEach((card: Card, cardIdx: number) => {
        initOnPlay(
          G,
          ctx,
          zone,
          zoneIdx,
          card,
          cardIdx,
          fir,
          initEvent(G, ctx, zone, zoneIdx, card, cardIdx, fir)
        );
      });

      zone.sides[sec].forEach((card: Card, cardIdx: number) => {
        initOnPlay(
          G,
          ctx,
          zone,
          zoneIdx,
          card,
          cardIdx,
          sec,
          initEvent(G, ctx, zone, zoneIdx, card, cardIdx, sec)
        );
      });
    });

    ctx.events?.endPhase();
  },
};

function initOnPlay(
  G: GameState,
  ctx: Ctx,
  zone: Zone,
  zoneIdx: number,
  card: Card,
  cardIdx: number,
  player: PlayerID,
  callback?: () => void
) {
  const { opponent } = getContextualPlayerIds(player);
  const revealedThisTurn = card.revealedOnTurn === G.turn;
  const hasOnPlay = card.mechanics?.includes('ON_PLAY');

  if (revealedThisTurn && hasOnPlay) {
    initCardMechanicsByKey(
      G,
      ctx,
      G.gameConfig,
      zone,
      zoneIdx,
      card,
      cardIdx,
      player,
      opponent
    );
  }

  if (callback) return callback;
}

function initEvent(
  G: GameState,
  ctx: Ctx,
  zone: Zone,
  zoneIdx: number,
  card: Card,
  cardIdx: number,
  player: PlayerID,
  callback?: () => void
) {
  if (card.mechanics?.includes('EVENT')) {
    eventMechs(G, ctx, zone, zoneIdx, card, cardIdx, player);
  }

  if (callback) return callback;
}

function onPlayMechs(
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
    // @todo
    case 'GAME_006':
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

    default:
      break;
  }
}

function eventMechs(
  G: GameState,
  ctx: Ctx,
  zone: Zone,
  zoneIdx: number,
  card: Card,
  cardIdx: number,
  player: PlayerID
) {
  const {
    gameConfig,
    gameConfig: {
      numerics: { cardsPerHand, numberOfSlotsPerZone },
    },
  } = G;

  const { opponent } = getContextualPlayerIds(player);

  switch (card.id) {
    case 'GAME_008':
      G.zones[zoneIdx].sides[player].forEach((c: Card, i: number) => {
        let playedThisTurn: number = 0;
        const isNotCardPlayed = card.uuid !== c.uuid;

        if (isNotCardPlayed) {
          add(playedThisTurn, 1);
        }

        // console.log(playedThisTurn);
        if (playedThisTurn > 0) {
          card.powerStream.push({
            blame: c.id,
            adjustment: 1,
            currentPower: add(card.displayPower, 1),
          });

          card.displayPower = getCardPower(card);
        }
      });
      break;

    default:
      break;
  }
}

export default initCardMechanicsPhase;
