import { gt, gte, lt } from 'lodash';
import { Ctx, Undo } from 'boardgame.io';
import { INVALID_MOVE } from 'boardgame.io/core';
import { Card, GameState, PlayerID } from '../types';
import { getCardPower, getContextualPlayerIds } from '../utils';
import { core043Destroy } from './mechanics/core-mechanics-by-key/mechanic.core.043';
import { core110Buff } from './mechanics/core-mechanics-by-key/mechanic.core.110';
import {
  actionPoints,
  canUndo,
  counts,
  playedCards,
  playerTurnDone,
  selectedCardData,
} from './state';
import { core031Buff } from './mechanics/core-mechanics-by-key/mechanic.core.031';
import { fxEnd } from './config.bgio-effects';
import { core044Attack } from './mechanics/core-mechanics-by-key/mechanic.core.044';
import { core058Attack } from './mechanics/core-mechanics-by-key/mechanic.core.058';
import { core050Attack } from './mechanics/core-mechanics-by-key/mechanic.core.050';
import { core053Attack } from './mechanics/core-mechanics-by-key/mechanic.core.053';
import { core056Attack } from './mechanics/core-mechanics-by-key/mechanic.core.056';

export const selectCard = (
  G: GameState,
  ctx: Ctx,
  playerId: PlayerID,
  cardUuid: string
) => {
  const hand = G.players[playerId].cards.hand;
  const cardMatch = hand.find((c: Card) => c.uuid === cardUuid);
  const cardMatchIndex = hand.findIndex((c: Card) => c.uuid === cardUuid);

  if (G.selectedCardData[playerId]?.uuid === cardMatch!.uuid) {
    selectedCardData.reset(G, playerId);
    // @ts-ignore
    ctx.effects?.fxEnd();
  } else {
    selectedCardData.set(G, playerId, cardMatch!);
    G.selectedCardIndex[playerId] = cardMatchIndex;
    // @ts-ignore
    ctx.effects?.fxEnd();
  }
};

export const deselectCard = (G: GameState, ctx: Ctx, playerId: PlayerID) => {
  selectedCardData.reset(G, playerId);
  G.selectedCardIndex[playerId] = undefined;
  // @ts-ignore
  ctx.effects?.fxEnd();
};

export const playCard = (
  G: GameState,
  ctx: Ctx,
  player: PlayerID,
  zoneNumber: number
) => {
  const { currentPlayer } = ctx;
  const {
    gameConfig: {
      numerics: { numberOfSlotsPerZone },
    },
    zones,
  } = G;

  // validate selected card
  if (G.selectedCardData[player] === undefined) return INVALID_MOVE;

  const ap = G.actionPoints;
  const playerObj = G.players[player];
  const card = G.selectedCardData[player]! as Card;
  const cardUuid = G.selectedCardData[player]!.uuid;
  const zone = zones[zoneNumber];
  const cantAffordCard = !gte(ap[player].current, card.currentCost);

  if (cantAffordCard) return INVALID_MOVE;

  // validate zone playability
  if (zone.sides[player].length > numberOfSlotsPerZone) return INVALID_MOVE;
  if (zone.disabled[player]) return INVALID_MOVE;

  // add card to PlayedCards array
  playedCards.push(G, player, card);

  // remove cost from current action points
  actionPoints.subtract(G, player, card.currentCost);

  // push card to zone side array
  zone.sides[player].push({
    ...card,
    revealed: true, // reveal card
    displayPower: getCardPower(card), // set display power
    revealedOnTurn: G.turn, // set revealedOnTurn value
  });

  // remove card from hand
  const newHand = playerObj.cards.hand.filter((c: Card) => c.uuid !== cardUuid);
  G.players[player].cards.hand = newHand;

  // recount cards in hand
  counts.decrementHand(G, player);

  // re-evaluate cards in hand
  if (gte(playerObj.cards.hand.length, 1)) {
    playerObj.cards.hand.forEach((c: Card) => {
      if (ap[player].current >= c.currentCost) {
        return (c.canPlay = true);
      } else {
        return (c.canPlay = false);
      }
    });
  }

  // unset selected card
  selectedCardData.reset(G, player);
  G.selectedCardIndex[player] = undefined;
  canUndo.setPlayer(G, player);
  fxEnd(ctx);
};

export const undoPlayCard = (
  G: GameState,
  ctx: Ctx,
  playerId: PlayerID,
  undo: Undo
) => {
  if (G.canUndo[playerId]) {
    // () => undo;
    canUndo.resetPlayer(G, playerId);
  }
};

export const revealCard = async (
  G: GameState,
  ctx: Ctx,
  playerId: string,
  zoneNumber: number,
  obj: Card,
  objIndex: number
) => {
  const zoneRefs = G.zonesCardsReference;
  const cardToReveal = zoneRefs[zoneNumber][playerId][objIndex];
  const cardToPush = {
    ...cardToReveal,
    revealed: true, // reveal card
    displayPower: getCardPower(obj), // set display power
    revealedOnTurn: G.turn, // set revealedOnTurn value
  };

  G.zones[zoneNumber].sides[playerId][objIndex] = cardToPush;

  // console.log(`
  //     MOVE: revealCard()
  //     CARD: [${cardToPush.id}] ${cardToPush.name}
  //    ZONE#: ${zoneNumber}
  //    SLOT#: ${objIndex}
  //   PLAYER: ${playerId}
  // `);

  // @ts-ignore
  ctx.effects.revealCard({
    card: cardToPush,
    zoneNumber,
    slotIndex: objIndex,
    player: playerId,
  });
};

export const playAiCard = (
  G: GameState,
  ctx: Ctx,
  aiID: PlayerID,
  zoneNumber: number,
  card: Card,
  cardIndex: number
) => {
  const {
    zones,
    gameConfig: {
      numerics: { numberOfSlotsPerZone },
    },
  } = G;

  // set selected card
  G.selectedCardData[aiID] = card;
  G.selectedCardIndex[aiID] = cardIndex;

  const player = G.players[aiID];
  const cardUuid = card.uuid;
  const zone = zones[zoneNumber];
  const zoneSideLength = zone.sides[aiID].length;
  const currentAP = G.actionPoints[aiID].current;
  const cannotAffordCard = lt(currentAP, card.currentCost);
  const zoneHasNoAvailableSlots = gte(zoneSideLength, numberOfSlotsPerZone);
  const zoneIsDisabled = zone.disabled[aiID];

  // validate cost playability
  if (cannotAffordCard || zoneHasNoAvailableSlots || zoneIsDisabled) {
    return INVALID_MOVE;
  }

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

  // remove card from hand
  const newHand = player.cards.hand.filter((c: Card) => c.uuid !== cardUuid);
  G.players[aiID].cards.hand = newHand;

  // recount cards in hand
  counts.decrementHand(G, aiID);

  // re-evaluate cards in hand
  G.players[aiID].cards.hand.forEach((c: Card) => {
    if (G.actionPoints[aiID].current >= c.currentCost) {
      return (c.canPlay = true);
    } else {
      return (c.canPlay = false);
    }
  });

  // unset selectedCard
  selectedCardData.reset(G, aiID);
  G.selectedCardIndex[aiID] = undefined;
};

export const setDone = (G: GameState, ctx: Ctx, player: PlayerID) => {
  playerTurnDone.set(G, player);
};

export const attackMinion = (
  G: GameState,
  ctx: Ctx,
  player: PlayerID,
  cardToAttackUuid: string,
  zoneNumber: number
) => {
  const { opponent } = getContextualPlayerIds(player);
  const { playedCards } = G;
  const lastPlayedCard = playedCards[player][playedCards[player].length - 1];

  G.zones[zoneNumber].sides[opponent].forEach((c) => {
    if (c.uuid === cardToAttackUuid) {
      switch (lastPlayedCard?.key) {
        case 'SET_CORE_044':
          return core044Attack(G, ctx, opponent, c?.uuid, lastPlayedCard);
        case 'SET_CORE_050':
          return core050Attack(G, ctx, opponent, c?.uuid, lastPlayedCard);
        case 'SET_CORE_053':
          return core053Attack(G, ctx, opponent, c?.uuid, lastPlayedCard);
        case 'SET_CORE_056':
          return core056Attack(G, ctx, opponent, c?.uuid, lastPlayedCard);
        case 'SET_CORE_058':
          return core058Attack(G, ctx, opponent, c?.uuid, lastPlayedCard);
        default:
          return;
      }
    }
  });
};

export const buffMinion = (
  G: GameState,
  ctx: Ctx,
  player: PlayerID,
  cardToBuffUuid: string,
  zoneNumber: number
) => {
  const { playedCards } = G;
  const lastPlayedCard = playedCards[player][playedCards[player].length - 1];
  G.zones[zoneNumber].sides[player].forEach((c) => {
    if (c.uuid === cardToBuffUuid) {
      switch (lastPlayedCard?.key) {
        case 'SET_CORE_031':
          return core031Buff(G, ctx, player, c, lastPlayedCard);
        case 'SET_CORE_110':
          return core110Buff(G, ctx, player, c, lastPlayedCard);

        default:
          return;
      }
    }
  });
};

export const destroyMinion = (
  G: GameState,
  ctx: Ctx,
  player: PlayerID,
  cardToDestroyUuid: string,
  zoneNumber: number
) => {
  const { opponent } = getContextualPlayerIds(player);
  const { playedCards } = G;
  const lastPlayedCard = playedCards[player][playedCards[player].length - 1];

  G.zones[zoneNumber].sides[opponent].forEach((c) => {
    if (c.uuid === cardToDestroyUuid) {
      switch (lastPlayedCard?.key) {
        case 'SET_CORE_043':
          return core043Destroy(G, ctx, opponent, c?.uuid);
        default:
          return;
      }
    }
  });
};

export const healMinion = (
  G: GameState,
  ctx: Ctx,
  player: PlayerID,
  cardToHealUuid: string,
  zoneNumber: number
) => {
  const { playedCards } = G;
  const lastPlayedCard = playedCards[player][playedCards[player].length - 1];
  G.zones[zoneNumber].sides[player].forEach((c) => {
    if (c.uuid === cardToHealUuid) {
      switch (lastPlayedCard?.key) {
        case 'SET_CORE_031':
          return core031Buff(G, ctx, player, c, lastPlayedCard);

        default:
          return;
      }
    }
  });
};

export const updatePlayerHandArray = (
  G: GameState,
  ctx: Ctx,
  player: PlayerID,
  cardUuid: string
) => {
  const newHand = G.players[player].cards.hand.filter(
    (c) => c.uuid !== cardUuid
  );
  G.players[player].cards.hand = newHand;
};
