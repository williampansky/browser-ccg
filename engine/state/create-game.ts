import { produce } from 'immer';
import type { Rng } from '../rng';
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
  fatigue: 0,
});

/**
 * Builds a new game: shuffles both decks, deals opening hands (3 / 4), then starts turn 1.
 * (The second player's bonus "The Orb" card arrives with spells, a later slice.)
 */
export const createGame = (setup: GameSetup, rng: Rng): GameState => {
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
  };

  const dealt = produce(initial, (g) => {
    g.players[first].hand = g.players[first].deck.splice(0, FIRST_PLAYER_HAND);
    g.players[second].hand = g.players[second].deck.splice(0, SECOND_PLAYER_HAND);
  });
  return startTurn(dealt, first, []);
};
