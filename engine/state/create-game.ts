import { produce } from 'immer';
import type { Rng } from '../rng';
import { MAX_DECK_SIZE } from '../deck-rules';
import { startTurn } from '../rules/turn';
import { CardInstance, GameSetup, GameState, MAX_HEALTH, PlayerId, PlayerState } from './types';

const FIRST_PLAYER_HAND = 3;
const SECOND_PLAYER_HAND = 4;

const emptyPlayer = (deck: CardInstance[]): PlayerState => ({
  health: MAX_HEALTH,
  armor: 0,
  energy: { current: 0, total: 0 },
  deck,
  hand: [],
  board: [],
  weapon: null,
  weaponAttacksThisTurn: 0,
  fatigue: 0,
});

/**
 * Builds a new game: shuffles both decks, deals opening hands (3 / 4), then starts turn 1.
 * The second player also gets `secondPlayerBonusCard` (The Orb) if given.
 */
export const createGame = (setup: GameSetup, rng: Rng): GameState => {
  (['0', '1'] as PlayerId[]).forEach((p) => {
    if (setup.decks[p].length > MAX_DECK_SIZE) {
      throw new Error(`Player ${Number(p) + 1}'s deck has ${setup.decks[p].length} cards; the most allowed is ${MAX_DECK_SIZE}.`);
    }
  });
  let nextInstanceId = 1;
  const build = (cardIds: string[]): CardInstance[] =>
    rng.shuffle(cardIds).map((cardId) => ({ instanceId: nextInstanceId++, cardId }));

  const first: PlayerId = setup.firstPlayer;
  const second: PlayerId = first === '0' ? '1' : '0';
  const decks = { [first]: build(setup.decks[first]), [second]: build(setup.decks[second]) };

  const initial: GameState = {
    turn: 0,
    activePlayer: second, // startTurn flips to the other player, so turn 1 belongs to `first`
    status: 'playing',
    winner: null,
    players: { [first]: emptyPlayer(decks[first]), [second]: emptyPlayer(decks[second]) } as Record<
      PlayerId,
      PlayerState
    >,
    nextInstanceId,
    nextPlaySeq: 1,
    played: { '0': [], '1': [] },
  };

  const dealt = produce(initial, (g) => {
    g.players[first].hand = g.players[first].deck.splice(0, FIRST_PLAYER_HAND);
    g.players[second].hand = g.players[second].deck.splice(0, SECOND_PLAYER_HAND);
    if (setup.secondPlayerBonusCard) {
      g.players[second].hand.push({ instanceId: g.nextInstanceId++, cardId: setup.secondPlayerBonusCard });
    }
  });
  return startTurn(dealt, first, []);
};
