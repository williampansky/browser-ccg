import { current } from 'immer';
import { Ctx, LongFormMove } from 'boardgame.io';
import { CardPlayType, CardRace, LastMoveMade, Mechanics } from '../../enums';
import { Card, GameState, PlayerID } from '../../types';
import {
  aiDealTargetedDamageToMinion,
  cardUuidMatch,
  filterArray,
  getCardPower,
  initActivateEventListeners,
  pushEventStream,
  pushEventStreamAndSetBoolean,
  pushPowerStreamAndSetDisplay,
  removeLastPlayedCardFromHand,
} from '../../utils';
import {
  actionPoints,
  counts,
  lastCardPlayed,
  playedCards,
  playerTurnDone,
} from '../state';
import { fxEnd } from '../config.bgio-effects';
import { INVALID_MOVE } from 'boardgame.io/core';
import { gte, lt, lte, set } from 'lodash';
import {
  determineOnPlayGlobalMechanic,
  determineTargetedOnPlayContext,
} from '../moves/on-play.move.methods';
import { add } from 'mathjs';
import { boonPowerOfCardsInZone, dealAoeDamageOnPlay } from '../mechanics/on-play-mechanics';
import core031 from '../mechanics/core-mechanics-by-key/mechanic.core.031';
import core005 from '../mechanics/core-mechanics-by-key/mechanic.core.005';
import core004 from '../mechanics/core-mechanics-by-key/mechanic.core.004';
import core006 from '../mechanics/core-mechanics-by-key/mechanic.core.006';
import core007 from '../mechanics/core-mechanics-by-key/mechanic.core.007';
import core011 from '../mechanics/core-mechanics-by-key/mechanic.core.011';
import core019 from '../mechanics/core-mechanics-by-key/mechanic.core.019';
import core029 from '../mechanics/core-mechanics-by-key/mechanic.core.029';
import core042 from '../mechanics/core-mechanics-by-key/mechanic.core.042';
import core043 from '../mechanics/core-mechanics-by-key/mechanic.core.043';
import core044 from '../mechanics/core-mechanics-by-key/mechanic.core.044';
import core110 from '../mechanics/core-mechanics-by-key/mechanic.core.110';
import core036 from '../mechanics/core-mechanics-by-key/mechanic.core.036';
import core133 from '../mechanics/core-mechanics-by-key/mechanic.core.133';
import core126 from '../mechanics/core-mechanics-by-key/mechanic.core.126';
import core071 from '../mechanics/core-mechanics-by-key/mechanic.core.071';
import core060 from '../mechanics/core-mechanics-by-key/mechanic.core.060';
import core050 from '../mechanics/core-mechanics-by-key/mechanic.core.050';
import core025 from '../mechanics/core-mechanics-by-key/mechanic.core.025';
import core037 from '../mechanics/core-mechanics-by-key/mechanic.core.037';
import core039 from '../mechanics/core-mechanics-by-key/mechanic.core.039';
import core041 from '../mechanics/core-mechanics-by-key/mechanic.core.041';
import core056 from '../mechanics/core-mechanics-by-key/mechanic.core.056';
import core082 from '../mechanics/core-mechanics-by-key/mechanic.core.082';

export const aiPlayCard: LongFormMove = {
  client: false,
  noLimit: true,
  ignoreStaleStateID: true,
  undoable: false,
  move: (
    G: GameState,
    ctx: Ctx,
    aiID: PlayerID,
    zoneNumber: number,
    card: Card,
    cardIndex: number
  ) => {
    return aiPlayCardMove(G, ctx, aiID, zoneNumber, card, cardIndex);
  },
};

export interface AiPlayCardMove {
  G: GameState;
  ctx: Ctx;
  aiID: PlayerID;
  zoneNumber: number;
  card: Card;
  cardIndex: number;
}

export const aiPlayCardMove = (
  G: GameState,
  ctx: Ctx,
  aiID: PlayerID,
  zoneNumber: number,
  card: Card,
  cardIndex: number
) => {
  const slotsPerZone = G.gameConfig.numerics.numberOfSlotsPerZone;
  const ap = G.actionPoints;
  const zone = G.zones[zoneNumber];
  const cantAffordCard = !gte(ap[aiID].current, card.currentCost);
  const zoneIsDisabled = zone.disabled[aiID];
  const zoneIsFull = lt(zone.sides[aiID].length, slotsPerZone);

  // validate move
  if (cantAffordCard) {
    console.error(
      'INVALID_MOVE(cantAffordCard)',
      'apC: ' + ap[aiID].current,
      'cost: ' + card.currentCost
    );
    return INVALID_MOVE;
  }

  if (zoneIsDisabled) {
    console.error(
      'INVALID_MOVE(zoneIsDisabled)',
      'zone ' + zoneNumber,
      'disabled: ' + zone.disabled[aiID]
    );
    return INVALID_MOVE;
  }

  // if (zoneIsFull) {
  //   console.error('INVALID_MOVE(zoneIsFull)', 'zone ' + zoneNumber, 'length: ' + zone.sides[player].length);
  //   return INVALID_MOVE;
  // }

  // add card to PlayedCards array
  playedCards.push(G, aiID, card);

  // remove cost from current action points
  actionPoints.subtract(G, aiID, card.currentCost);

  // push card to zone side array
  zone.sides[aiID].push({
    ...card,
    revealed: true, // reveal card
    displayPower: getCardPower(card), // set display power
    revealedOnTurn: G.turn, // set revealedOnTurn value
  });

  // reset datas
  lastCardPlayed.set(G, { card, index: cardIndex });
  removeLastPlayedCardFromHand(G, aiID);

  // set last move
  G.lastMoveMade = LastMoveMade.aiPlayCard;

  // init card mechs
  if (cardIndex) {
    switch (card.key) {
      case 'SET_CORE_004':
        core004.execAi(G, ctx, aiID, zoneNumber, card, cardIndex);
        break;
      case 'SET_CORE_005':
        core005.execAi(G, ctx, aiID, zoneNumber, card);
        break;
      case 'SET_CORE_006':
        core006.execAi(G, ctx, aiID, zoneNumber, card, cardIndex);
        break;
      case 'SET_CORE_007':
        core007.execAi(G, ctx, aiID, zoneNumber, card, cardIndex);
        break;
      case 'SET_CORE_011':
        core011.execAi(G, ctx, aiID, zoneNumber, card, cardIndex);
        break;
      case 'SET_CORE_019':
        core019.execAi(G, ctx, aiID, zoneNumber, card, cardIndex);
        break;
      case 'SET_CORE_025':
        core025.exec(G, ctx, aiID, zoneNumber, card);
        break;
      case 'SET_CORE_029':
        core029.execAi(G, ctx, aiID, zoneNumber, card, cardIndex);
        break;
      case 'SET_CORE_031':
        core031.execAi(G, ctx, aiID, card);
        break;
      case 'SET_CORE_036':
        core036.execAi(G, ctx, aiID, zoneNumber, card, cardIndex);
        break;
      case 'SET_CORE_037':
        core037.exec(G, ctx, aiID, zoneNumber, card);
        break;
      case 'SET_CORE_039':
        core039.execAi(G, ctx, aiID, zoneNumber, card, cardIndex);
        break;
      case 'SET_CORE_041':
        core041.exec(G, ctx, aiID, zoneNumber, card);
        break;
      case 'SET_CORE_042':
        core042.execAi(G, ctx, aiID, zoneNumber, card, cardIndex);
        break;
      case 'SET_CORE_043':
        core043.execAi(G, ctx, aiID, zoneNumber, card, cardIndex);
        break;
      case 'SET_CORE_044':
        aiDealTargetedDamageToMinion(G, ctx, aiID, card);
        break;
      case 'SET_CORE_050':
        core050.execAi(G, ctx, aiID, card);
        break;
      case 'SET_CORE_053':
        aiDealTargetedDamageToMinion(G, ctx, aiID, card);
        break;
      case 'SET_CORE_056':
        core056.execAi(G, ctx, aiID, zoneNumber, card, cardIndex);
        break;
      case 'SET_CORE_058':
        aiDealTargetedDamageToMinion(G, ctx, aiID, card);
        break;
      case 'SET_CORE_060':
        core060.execAi(G, ctx, aiID, zoneNumber, card);
        break;
      case 'SET_CORE_071':
        core071.execAi(G, ctx, aiID, zoneNumber, card);
        break;
      case 'SET_CORE_082':
        core082.execAi(G, ctx, aiID, zoneNumber, card, cardIndex);
        break;
      case 'SET_CORE_108':
        boonPowerOfCardsInZone(G, ctx, zoneNumber, card, aiID);
        break;
      case 'SET_CORE_110':
        core110.execAi(G, ctx, aiID, card);
        break;
      case 'SET_CORE_112':
        aiDealTargetedDamageToMinion(G, ctx, aiID, card);
        break;
      case 'SET_CORE_120':
        aiDealTargetedDamageToMinion(G, ctx, aiID, card);
        break;
      case 'SET_CORE_121':
        dealAoeDamageOnPlay(G, ctx, aiID, card, card.mechanicsSide);
        break;
      case 'SET_CORE_122':
        dealAoeDamageOnPlay(G, ctx, aiID, card, card.mechanicsSide);
        break;
      case 'SET_CORE_126':
        core126.execAi(G, ctx, aiID, zoneNumber, card, cardIndex);
        break;
      case 'SET_CORE_133':
        core133.execAi(G, ctx, card, aiID);
        break;
      default:
        break;
    }
  }

  // check active listeners
  initActivateEventListeners(G, ctx);
};

export const aiSetDone: LongFormMove = {
  client: false,
  noLimit: true,
  ignoreStaleStateID: true,
  undoable: false,
  move: (G: GameState, ctx: Ctx, { aiID }: AiPlayCardMove) => {
    return aiSetDoneMove(G, ctx, { aiID });
  },
};

export interface AiSetDoneMove {
  aiID: PlayerID;
}

export const aiSetDoneMove = (
  G: GameState,
  ctx: Ctx,
  { ...args }: AiSetDoneMove
) => {
  // const { aiID } = args;
  const aiID = '1';
  G.lastMoveMade = LastMoveMade.AiSetDone;
  playerTurnDone.set(G, aiID);

  if (G.gameConfig.debugConfig.logPhaseToConsole) {
    console.log(`--- setDoneMove(${aiID}) ---`);
  }
};
