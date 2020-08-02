import { ActivePlayers } from 'boardgame.io/core';
import counts from '../state/counts';
import drawCard, { drawSpecificCard } from '../moves/draw-card';
import getCardByID from '../utils/get-card-by-id';
import logMessage from '../match-history/log-message';

function getStartingHand(cards, discard) {
  let newArray = [];
  cards.forEach(c => {
    for (let i = 0; i < discard.length; i++) {
      if (c.uuid === discard[i].uuid) return;
    }
    return newArray.push(c);
  });
  return newArray;
}

export default {
  onBegin: (G, ctx) => {
    const FIRST_PLAYER = G.turnOrder['0'];
    const SECOND_PLAYER = G.turnOrder['1'];

    logMessage(G, ctx, 'matchStart');

    if (G.serverConfig.matchConfig.enableInitHandsStage) {
      // get the first few cards from each player's deck
      G.initHandsSelection[FIRST_PLAYER].cards = G.players[FIRST_PLAYER].deck
        .splice(0, 3)
        .map(id => getCardByID(id));
      G.initHandsSelection[SECOND_PLAYER].cards = G.players[SECOND_PLAYER].deck
        .splice(0, 4)
        .map(id => getCardByID(id));
    } else {
      // faux-end card selection
      G.initHandsSelection[G.turnOrder['0']].ready = true;
      G.initHandsSelection[G.turnOrder['1']].ready = true;

      // Draw three cards from the first player's deck into their hand.
      drawCard(G, ctx, FIRST_PLAYER, 9); // default/prod is 3

      // Draw four cards from the first player's deck into their hand;
      // they get four cards since they are not the starting player.
      drawCard(G, ctx, SECOND_PLAYER, 4);

      // Give the second player the Energy card (The Orb), which when
      // played gives that player an additional energy point for the turn.
      counts.incrementHand(G, SECOND_PLAYER);
      G.players[SECOND_PLAYER].hand.push(getCardByID('GAME_001'));
    }
  },

  onEnd: (G, ctx) => {
    if (G.serverConfig.matchConfig.enableInitHandsStage) {
      const FIRST_PLAYER = G.turnOrder['0'];
      const SECOND_PLAYER = G.turnOrder['1'];

      // Draw the chosen cards from the first player's deck into their hand.
      getStartingHand(
        G.initHandsSelection[FIRST_PLAYER].cards,
        G.initHandsSelection[FIRST_PLAYER].discard
      ).forEach(element => {
        drawSpecificCard(G, FIRST_PLAYER, element.id);
      });

      // Draw the length of discarded cards for player 1
      drawCard(
        G,
        ctx,
        FIRST_PLAYER,
        G.initHandsSelection[FIRST_PLAYER].discard.length
      );

      // Draw the chosen cards from the second player's deck into their hand.
      getStartingHand(
        G.initHandsSelection[SECOND_PLAYER].cards,
        G.initHandsSelection[SECOND_PLAYER].discard
      ).forEach(element => {
        drawSpecificCard(G, SECOND_PLAYER, element.id);
      });

      // Draw the length of discarded cards for player 2
      drawCard(
        G,
        ctx,
        SECOND_PLAYER,
        G.initHandsSelection[SECOND_PLAYER].discard.length
      );

      // Give the second player the Energy card (The Orb), which when
      // played gives that player an additional energy point for the turn.
      counts.incrementHand(G, SECOND_PLAYER);
      G.players[SECOND_PLAYER].hand.push(getCardByID('GAME_001'));
    }
  },

  moves: {
    replaceCard: {
      client: false,
      move: (G, ctx, playerId, cardObject) => {
        const { uuid } = cardObject;
        const discards = G.initHandsSelection[playerId].discard;

        if (discards.find(obj => obj.uuid === uuid)) {
          G.initHandsSelection[playerId].discard = G.initHandsSelection[
            playerId
          ].discard.filter(card => card.uuid !== uuid);
        } else {
          G.initHandsSelection[playerId].discard.push(cardObject);
        }
      }
    },
    setReady: {
      client: false,
      move: (G, ctx, playerId) => {
        G.initHandsSelection[playerId].ready = true;
      }
    }
  },

  turn: {
    activePlayers: ActivePlayers.ALL
  },

  // End phase when both player's have their starting hands
  // prettier-ignore
  endIf: G => (
    G.initHandsSelection[G.turnOrder['0']].ready === true && 
    G.initHandsSelection[G.turnOrder['1']].ready === true
  ),

  next: 'playGamePhase'
};
