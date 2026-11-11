import { createGame } from '../../state/create-game';
import { applyAction } from '../apply-action';
import { createSeededRng } from '../../rng';
import { catalogOf, minionCard, putInHand, putOnBoard, setEnergy, spellCard } from '../../testing/builders';
import { on } from '../../definitions/define-card';
import type { CardDef } from '../../definitions/define-card';
import { damage, draw, gainEnergy } from '../../effects/primitives';
import { allMinions, enemyHero, allEnemyMinions } from '../../effects/selectors';
import type { Card } from '../../cards/types';
import type { Action, GameEvent, GameState } from '../../state/types';

// Test-only behaviour, injected through `ctx.defs`, so these tests cover the mechanism, not real cards.
const testDefs: Record<string, CardDef> = {
  T_BOOM: { onPlay: [damage(allMinions(), 9)] },
  T_DEATHDRAW: { onDeath: [draw(1)] },
  T_DYER: { onDeath: [damage(allEnemyMinions(), 9)] },
  T_ENDPING: {
    triggers: [on('TurnEnded', { when: (e, c) => e.player === c.owner, do: [damage(enemyHero(), 1)] })],
  },
  T_LOOP: { triggers: [on('EnergyGained', { do: [gainEnergy(1)] })] },
  T_ORB: { onPlay: [gainEnergy(1)] },
};
const defs = (card: Card) => testDefs[card.id];

const plain = minionCard('T_PLAIN', { attack: 1, health: 2 });
const catalog = catalogOf(
  plain,
  minionCard('T_DEATHDRAW', { attack: 1, health: 1 }),
  minionCard('T_DYER', { attack: 1, health: 1 }),
  minionCard('T_ENDPING', { attack: 1, health: 3 }),
  minionCard('T_LOOP', { attack: 1, health: 3 }),
  spellCard('T_BOOM', 1),
  spellCard('T_ORB', 0)
);

const fresh = (): GameState =>
  createGame(
    { decks: { '0': Array(30).fill('T_PLAIN'), '1': Array(30).fill('T_PLAIN') }, firstPlayer: '0' },
    createSeededRng(1)
  );
const run = (s: GameState, a: Action) => applyAction(s, a, { rng: createSeededRng(1), catalog, defs });
const act = (s: GameState, a: Action): { state: GameState; events: GameEvent[] } => {
  const r = run(s, a);
  if ('error' in r) throw new Error(`unexpected ${r.error}`);
  return r;
};
const withHand = (...ids: string[]): GameState => {
  let s = fresh();
  s = { ...s, players: { ...s.players, '0': { ...s.players['0'], hand: [] } } };
  for (const id of ids) s = putInHand(s, '0', id);
  return setEnergy(s, '0', 10);
};
const card = (id: string) => catalog.get(id) as Card;
const died = (events: GameEvent[]) => events.filter((e) => e.type === 'MinionDied');

describe('death order (RULES Q15)', () => {
  it('removes dead minions in play order, across both boards, not by side or position', () => {
    let s = withHand('T_BOOM');
    s = putOnBoard(s, '1', plain); // seq 1
    s = putOnBoard(s, '0', plain); // seq 2
    s = putOnBoard(s, '1', plain); // seq 3
    const idBySeq = [s.players['1'].board[0], s.players['0'].board[0], s.players['1'].board[1]].map((m) => m.instanceId);
    const { state, events } = act(s, { type: 'PlayCard', handIndex: 0 });
    expect(died(events).map((e) => (e as { instanceId: number }).instanceId)).toEqual(idBySeq);
    expect(state.players['0'].board).toHaveLength(0);
    expect(state.players['1'].board).toHaveLength(0);
  });
  it('minions that enter play later die later even if they sit further left', () => {
    let s = withHand('T_BOOM', 'T_PLAIN');
    s = setEnergy(s, '0', 10);
    s = putOnBoard(s, '0', plain);
    const first = s.players['0'].board[0].instanceId;
    s = act(s, { type: 'PlayCard', handIndex: 1, boardIndex: 0 }).state; // new minion at the left
    const second = s.players['0'].board[0].instanceId;
    const { events } = act(s, { type: 'PlayCard', handIndex: 0 });
    expect(died(events).map((e) => (e as { instanceId: number }).instanceId)).toEqual([first, second]);
  });
});

describe('death effects', () => {
  it('run after the minion is gone, for its owner', () => {
    let s = withHand('T_BOOM');
    s = putOnBoard(s, '1', card('T_DEATHDRAW'));
    const before = s.players['1'].hand.length;
    // The enemy's minion dies on my turn, so the enemy (its owner) draws.
    const { state } = act(s, { type: 'PlayCard', handIndex: 0 });
    expect(state.players['1'].hand).toHaveLength(before + 1);
  });
  it('can kill more minions, which are settled too, in order', () => {
    let s = withHand('T_BOOM');
    s = putOnBoard(s, '0', card('T_DYER')); // when it dies, damages P1's minions
    s = putOnBoard(s, '0', plain);
    s = putOnBoard(s, '1', plain);
    // Boom kills everything at once already; instead check the chain with an attack.
    s = withHand();
    s = putOnBoard(s, '0', card('T_DYER'));
    s = putOnBoard(s, '1', plain);
    s = putOnBoard(s, '1', minionCard('T_PLAIN', { attack: 1, health: 9 }));
    const dyer = s.players['0'].board[0].instanceId;
    const victim = s.players['1'].board[0].instanceId;
    const { state, events } = act(s, { type: 'Attack', attackerId: dyer, target: { kind: 'minion', instanceId: victim } });
    // The dyer (1 health) trades with the victim; its death effect then deals 9 to every enemy minion.
    expect(state.players['0'].board).toHaveLength(0);
    expect(state.players['1'].board).toHaveLength(0);
    expect(died(events)).toHaveLength(3);
  });
});

describe('triggers', () => {
  it('end-of-turn effects fire for the owner only, before the next turn starts', () => {
    let s = putOnBoard(fresh(), '0', card('T_ENDPING'));
    const { state, events } = act(s, { type: 'EndTurn' });
    expect(state.players['1'].health).toBe(29);
    const i = events.findIndex((e) => e.type === 'HeroDamaged');
    const j = events.findIndex((e) => e.type === 'TurnStarted');
    expect(i).toBeGreaterThan(-1);
    expect(i).toBeLessThan(j);
    // The opponent ending their turn does not trigger my minion.
    const again = act(state, { type: 'EndTurn' }).state;
    expect(again.players['1'].health).toBe(29);
  });
  it('an end-of-turn effect can win the game before the next turn begins', () => {
    let s = putOnBoard(fresh(), '0', card('T_ENDPING'));
    s = { ...s, players: { ...s.players, '1': { ...s.players['1'], health: 1 } } };
    const { state, events } = act(s, { type: 'EndTurn' });
    expect(state).toMatchObject({ status: 'over', winner: '0', turn: 1 });
    expect(events.some((e) => e.type === 'TurnStarted')).toBe(false);
  });
  it('triggers belong to the board: a card in hand does nothing', () => {
    let s = putInHand(fresh(), '0', 'T_ENDPING');
    expect(act(s, { type: 'EndTurn' }).state.players['1'].health).toBe(30);
  });
  it('endless trigger chains stop with TRIGGER_LOOP and leave the input alone', () => {
    let s = putOnBoard(withHand('T_ORB'), '0', card('T_LOOP'));
    const snap = JSON.stringify(s);
    expect(run(s, { type: 'PlayCard', handIndex: 0 })).toEqual({ error: 'TRIGGER_LOOP' });
    expect(JSON.stringify(s)).toBe(snap);
  });
});
