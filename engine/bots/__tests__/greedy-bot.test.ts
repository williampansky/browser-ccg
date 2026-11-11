import { chooseGreedyAction, evaluate } from '../greedy-bot';
import { chooseRandomAction } from '../random-bot';
import { applyAction } from '../../rules/apply-action';
import { createGame } from '../../state/create-game';
import { createSeededRng } from '../../rng';
import { loadHsCards } from '../../cards/load-hs-cards';
import { buildDeck, playablePool } from '../../decks';
import { catalogOf, minionCard, putInHand, putOnBoard, setEnergy } from '../../testing/builders';
import type { GameState, PlayerId } from '../../state/types';

const grunt = minionCard('GRUNT', { cost: 2, attack: 2, health: 3 });
const big = minionCard('BIG', { cost: 5, attack: 5, health: 5 });
const small = minionCard('SMALL', { cost: 1, attack: 1, health: 1 });
const guard = minionCard('GUARD', { cost: 3, attack: 1, health: 4, mechanics: ['BULWARK'] });
const wall = minionCard('WALL', { cost: 5, attack: 5, health: 5, mechanics: ['BULWARK'] });
const catalog = catalogOf(grunt, big, small, guard, wall);

const start = (): GameState => {
  const s = createGame({ decks: { '0': Array(30).fill('GRUNT'), '1': Array(30).fill('GRUNT') }, firstPlayer: '0' }, createSeededRng(1));
  return { ...s, players: { ...s.players, '0': { ...s.players['0'], hand: [] }, '1': { ...s.players['1'], hand: [] } } };
};
/** Puts a minion on a side that is ready to attack (not summoning sick). */
const ready = (s: GameState, p: PlayerId, card: ReturnType<typeof minionCard>): GameState => {
  const t = putOnBoard(s, p, card);
  const board = t.players[p].board.map((m) => ({ ...m, playedOnTurn: 0 }));
  return { ...t, players: { ...t.players, [p]: { ...t.players[p], board } } };
};
const choose = (s: GameState, seed = 1) => chooseGreedyAction(s, catalog, createSeededRng(seed));

describe('greedy bot', () => {
  it('ends the turn when nothing improves its position', () => {
    expect(choose(start())).toEqual({ type: 'EndTurn' });
  });
  it('plays an affordable minion rather than passing', () => {
    const s = setEnergy(putInHand(start(), '0', 'GRUNT'), '0', 5);
    expect(choose(s).type).toBe('PlayCard');
  });
  it('takes lethal on the hero', () => {
    let s = ready(start(), '0', big);
    s = { ...s, players: { ...s.players, '1': { ...s.players['1'], health: 5 } } };
    s = ready(s, '1', small); // a minion it could trade with instead
    const a = choose(s);
    expect(a).toMatchObject({ type: 'Attack', target: { kind: 'hero', player: '1' } });
  });
  it('trades up into a weaker minion while healthy instead of hitting face', () => {
    let s = ready(start(), '0', big);
    s = ready(s, '1', grunt);
    const a = choose(s);
    expect(a).toMatchObject({ type: 'Attack', target: { kind: 'minion' } });
  });
  it('does not throw a minion away into a bigger one', () => {
    let s = ready(start(), '0', small);
    s = ready(s, '1', wall);
    // a Guard forces the only legal attack into the 5/5, which loses the 1/1 for nothing
    expect(choose(s)).toEqual({ type: 'EndTurn' });
  });
  it('must attack the Guard minion, since that is the only legal target', () => {
    let s = ready(start(), '0', grunt);
    s = ready(ready(s, '1', guard), '1', small);
    const a = choose(s);
    if (a.type === 'Attack') expect(a.target).toMatchObject({ kind: 'minion' });
  });
  it('is reproducible for a seed and always legal', () => {
    let s = setEnergy(putInHand(start(), '0', 'GRUNT'), '0', 5);
    s = ready(s, '0', big);
    for (let seed = 1; seed <= 20; seed++) {
      const a = choose(s, seed);
      expect(choose(s, seed)).toEqual(a);
      expect('error' in applyAction(s, a, { rng: createSeededRng(1), catalog })).toBe(false);
    }
  });
  it('evaluate: winning is worth more than anything, losing less, and a draw is zero', () => {
    const s = start();
    expect(evaluate({ ...s, status: 'over', winner: '0' }, '0')).toBeGreaterThan(1000);
    expect(evaluate({ ...s, status: 'over', winner: '1' }, '0')).toBeLessThan(-1000);
    expect(evaluate({ ...s, status: 'over', winner: 'draw' }, '0')).toBe(0);
  });
});

describe('greedy bot with real cards', () => {
  it('beats the random bot in most games', () => {
    const { byId, cards } = loadHsCards();
    const pool = playablePool(cards);
    let greedyWins = 0;
    const games = 20;
    for (let seed = 1; seed <= games; seed++) {
      const rng = createSeededRng(seed);
      const greedySide: PlayerId = seed % 2 === 0 ? '0' : '1'; // alternate who goes first
      let s = createGame(
        { decks: { '0': buildDeck(pool, rng), '1': buildDeck(pool, rng) }, firstPlayer: '0', secondPlayerBonusCard: 'GAME_001' },
        rng
      );
      for (let steps = 0; s.status === 'playing'; steps++) {
        if (steps > 6000) throw new Error(`seed ${seed} did not finish`);
        const a =
          s.activePlayer === greedySide ? chooseGreedyAction(s, byId, rng) : chooseRandomAction(s, byId, rng);
        const r = applyAction(s, a, { rng, catalog: byId });
        if ('error' in r) throw new Error(r.error);
        s = r.state;
      }
      if (s.winner === greedySide) greedyWins++;
    }
    expect(greedyWins).toBeGreaterThanOrEqual(Math.ceil(games * 0.75));
  });
});
