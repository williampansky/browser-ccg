import { createGame } from '../../state/create-game';
import { applyAction } from '../apply-action';
import { createSeededRng } from '../../rng';
import type { GameState, PlayerId } from '../../state/types';

const deckOf = (n: number, prefix = 'C') => Array.from({ length: n }, (_, i) => `${prefix}${i}`);
const rng = () => createSeededRng(1);
const newGame = (deckSize = 30, first: PlayerId = '0') =>
  createGame({ decks: { '0': deckOf(deckSize, 'A'), '1': deckOf(deckSize, 'B') }, firstPlayer: first }, rng());

const end = (s: GameState, r = rng()): GameState => {
  const res = applyAction(s, { type: 'EndTurn' }, r);
  if ('error' in res) throw new Error(res.error);
  return res.state;
};

describe('setup', () => {
  it('first player starts turn 1 with 1/1 energy and draws 3 + the turn draw', () => {
    const g = newGame();
    expect(g.turn).toBe(1);
    expect(g.activePlayer).toBe('0');
    expect(g.players['0'].energy).toEqual({ current: 1, total: 1 });
    expect(g.players['0'].hand).toHaveLength(4);
    expect(g.players['0'].deck).toHaveLength(26);
  });
  it('second player has 4 cards and 0 energy', () => {
    const g = newGame();
    expect(g.players['1'].hand).toHaveLength(4);
    expect(g.players['1'].energy).toEqual({ current: 0, total: 0 });
  });
  it('heroes start at 30 health, no armor', () => {
    const g = newGame();
    expect(g.players['0']).toMatchObject({ health: 30, armor: 0, fatigue: 0 });
  });
  it('is deterministic for the same seed and different for another', () => {
    expect(newGame()).toEqual(newGame());
    const other = createGame(
      { decks: { '0': deckOf(30, 'A'), '1': deckOf(30, 'B') }, firstPlayer: '0' },
      createSeededRng(2)
    );
    expect(other.players['0'].hand).not.toEqual(newGame().players['0'].hand);
  });
  it('gives every card a unique instance id', () => {
    const g = newGame();
    const ids = [0, 1].flatMap((p) => {
      const pl = g.players[String(p) as PlayerId];
      return [...pl.hand, ...pl.deck].map((c) => c.instanceId);
    });
    expect(new Set(ids).size).toBe(ids.length);
    expect(g.nextInstanceId).toBeGreaterThan(Math.max(...ids));
  });
  it('honours firstPlayer', () => {
    expect(newGame(30, '1').activePlayer).toBe('1');
  });
});

describe('EndTurn', () => {
  it('passes the turn, adds energy and draws one', () => {
    const g = end(newGame());
    expect(g.turn).toBe(2);
    expect(g.activePlayer).toBe('1');
    expect(g.players['1'].energy).toEqual({ current: 1, total: 1 });
    expect(g.players['1'].hand).toHaveLength(5);
  });
  it('does not mutate its input', () => {
    const g = newGame();
    const snapshot = JSON.stringify(g);
    end(g);
    expect(JSON.stringify(g)).toBe(snapshot);
  });
  it('energy grows by 1 per own turn and caps at 10', () => {
    let g = newGame();
    for (let i = 0; i < 30; i++) g = end(g);
    expect(g.players['0'].energy).toEqual({ current: 10, total: 10 });
    expect(g.players['1'].energy.total).toBe(10);
  });
  it('refills current energy to total each turn', () => {
    let g = newGame();
    g = { ...g, players: { ...g.players, '0': { ...g.players['0'], energy: { current: 0, total: 1 } } } };
    g = end(end(g));
    expect(g.players['0'].energy).toEqual({ current: 2, total: 2 });
  });
  it('the state stays JSON-serialisable', () => {
    const g = end(newGame());
    expect(JSON.parse(JSON.stringify(g))).toEqual(g);
  });
});

describe('draw', () => {
  it('burns the drawn card when the hand is full (hand stays at 10)', () => {
    let g = newGame();
    const hand = g.players['1'].hand;
    const extra = g.players['1'].deck.slice(0, 6);
    g = {
      ...g,
      players: {
        ...g.players,
        '1': { ...g.players['1'], hand: [...hand, ...extra, ...[]].slice(0, 10), deck: g.players['1'].deck.slice(6) },
      },
    };
    const deckBefore = g.players['1'].deck.length;
    g = end(g);
    expect(g.players['1'].hand).toHaveLength(10);
    expect(g.players['1'].deck).toHaveLength(deckBefore - 1);
  });
});

describe('fatigue', () => {
  const emptyDeckGame = () => {
    const g = newGame();
    return { ...g, players: { ...g.players, '1': { ...g.players['1'], deck: [] } } } as GameState;
  };
  it('deals escalating 1, 2, 3 damage on empty-deck draws', () => {
    let g = emptyDeckGame();
    g = end(g); // P1 turn: fatigue 1
    expect(g.players['1']).toMatchObject({ fatigue: 1, health: 29 });
    g = end(end(g)); // P1 again: fatigue 2
    expect(g.players['1']).toMatchObject({ fatigue: 2, health: 27 });
    g = end(end(g));
    expect(g.players['1']).toMatchObject({ fatigue: 3, health: 24 });
  });
  it('is absorbed by armor first', () => {
    let g = emptyDeckGame();
    g = { ...g, players: { ...g.players, '1': { ...g.players['1'], armor: 5 } } };
    g = end(g);
    expect(g.players['1']).toMatchObject({ armor: 4, health: 30 });
  });
});

describe('winning', () => {
  const lowHealth = (p: PlayerId, health: number, g = newGame()): GameState => ({
    ...g,
    players: { ...g.players, [p]: { ...g.players[p], health, deck: [] } },
  });
  it('the opponent wins when a hero dies of fatigue', () => {
    const g = end(lowHealth('1', 1));
    expect(g.status).toBe('over');
    expect(g.winner).toBe('0');
    expect(g.players['1'].health).toBe(0);
  });
  it('health never goes below 0', () => {
    const g = end(lowHealth('1', 1));
    expect(g.players['1'].health).toBeGreaterThanOrEqual(0);
  });
  it('concede makes the opponent win', () => {
    const res = applyAction(newGame(), { type: 'Concede' }, rng());
    if ('error' in res) throw new Error(res.error);
    expect(res.state).toMatchObject({ status: 'over', winner: '1' });
    expect(res.events).toContainEqual({ type: 'GameOver', winner: '1' });
  });
  it('rejects every action after the game is over', () => {
    const over = end(lowHealth('1', 1));
    expect(applyAction(over, { type: 'EndTurn' }, rng())).toEqual({ error: 'GAME_OVER' });
    expect(applyAction(over, { type: 'Concede' }, rng())).toEqual({ error: 'GAME_OVER' });
  });
});
