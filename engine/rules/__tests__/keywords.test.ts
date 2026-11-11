import { createGame } from '../../state/create-game';
import { applyAction } from '../apply-action';
import { createSeededRng } from '../../rng';
import { catalogOf, minionCard, putInHand, putOnBoard, setEnergy, spellCard } from '../../testing/builders';
import type { Action, ActionErrorCode, GameEvent, GameState, TargetRef } from '../../state/types';

const grunt = minionCard('GRUNT', { cost: 2, attack: 2, health: 3 });
const bubbly = minionCard('BUBBLY', { attack: 2, health: 3, mechanics: ['BUBBLE'] });
const twice = minionCard('TWICE', { attack: 1, health: 5, mechanics: ['DOUBLE_ATTACK'] });
const pacifist = minionCard('PACIFIST', { attack: 3, health: 3, mechanics: ['NO_ATTACK'] });
const ghost = minionCard('GHOST', { attack: 2, health: 3, mechanics: ['HIDDEN'] });
const zap = spellCard('CORE_044', 1, { primary: 2 });
const sweep = spellCard('CORE_065', 2, { primary: 1 });
const fireballs = spellCard('CORE_063', 1, { primary: 1, random: 5 });
const disableOne = spellCard('CORE_096', 2);
const disableAll = spellCard('CORE_068', 3);
const curse = spellCard('CORE_114', 1);
const giveBubble = spellCard('CORE_074', 1);
const giveDouble = spellCard('CORE_107', 2, { primary: 0, secondary: 0 });
const catalog = catalogOf(grunt, bubbly, twice, pacifist, ghost, zap, sweep, fireballs, disableOne, disableAll, curse, giveBubble, giveDouble);

const fresh = (): GameState =>
  createGame(
    { decks: { '0': Array(30).fill('GRUNT'), '1': Array(30).fill('GRUNT') }, firstPlayer: '0' },
    createSeededRng(1)
  );
const run = (s: GameState, a: Action) => applyAction(s, a, { rng: createSeededRng(1), catalog });
const act = (s: GameState, a: Action): GameState => {
  const r = run(s, a);
  if ('error' in r) throw new Error(`unexpected ${r.error}`);
  return r.state;
};
const eventsOf = (s: GameState, a: Action): GameEvent[] => {
  const r = run(s, a);
  if ('error' in r) throw new Error(r.error);
  return r.events;
};
const fail = (s: GameState, a: Action): ActionErrorCode => {
  const r = run(s, a);
  if (!('error' in r)) throw new Error('expected an error');
  return r.error;
};
const endTurn = (s: GameState) => act(s, { type: 'EndTurn' });
const withHand = (...ids: string[]): GameState => {
  let s = fresh();
  s = { ...s, players: { ...s.players, '0': { ...s.players['0'], hand: [] } } };
  for (const id of ids) s = putInHand(s, '0', id);
  return setEnergy(s, '0', 10);
};
const play = (target?: TargetRef): Action => ({ type: 'PlayCard', handIndex: 0, target });
const mref = (instanceId: number): TargetRef => ({ kind: 'minion', instanceId });
const hero1: TargetRef = { kind: 'hero', player: '1' };
const attack = (attackerId: number, target: TargetRef): Action => ({ type: 'Attack', attackerId, target });
const idOf = (s: GameState, p: '0' | '1', i = 0) => s.players[p].board[i].instanceId;

describe('Bubble', () => {
  const duel = () => {
    let s = putOnBoard(fresh(), '0', grunt);
    s = putOnBoard(s, '1', bubbly);
    return s;
  };
  it('absorbs the first hit from an attack and pops; the attacker still takes counter-damage', () => {
    const s = duel();
    const t = act(s, attack(idOf(s, '0'), mref(idOf(s, '1'))));
    expect(t.players['1'].board[0]).toMatchObject({ health: 3 });
    expect(t.players['1'].board[0].keywords.bubble).toBe(false);
    expect(t.players['0'].board[0].health).toBe(1);
    expect(eventsOf(s, attack(idOf(s, '0'), mref(idOf(s, '1'))))).toContainEqual({
      type: 'BubblePopped',
      instanceId: idOf(s, '1'),
    });
  });
  it('is gone for the second hit', () => {
    let s = duel();
    s = act(s, attack(idOf(s, '0'), mref(idOf(s, '1'))));
    s = endTurn(endTurn(s));
    const t = act(s, attack(idOf(s, '0'), mref(idOf(s, '1'))));
    expect(t.players['1'].board[0].health).toBe(1);
  });
  it('absorbs spell damage too (RULES Q13)', () => {
    let s = putOnBoard(withHand('CORE_044', 'CORE_044'), '1', bubbly);
    s = act(s, play(mref(idOf(s, '1'))));
    expect(s.players['1'].board[0]).toMatchObject({ health: 3 });
    s = act(s, play(mref(idOf(s, '1'))));
    expect(s.players['1'].board[0].health).toBe(1);
  });
  it("protects an attacker from the defender's counter-damage", () => {
    let s = putOnBoard(fresh(), '0', bubbly);
    s = putOnBoard(s, '1', grunt);
    const t = act(s, attack(idOf(s, '0'), mref(idOf(s, '1'))));
    expect(t.players['0'].board[0].health).toBe(3);
    expect(t.players['0'].board[0].keywords.bubble).toBe(false);
  });
  it('is not popped by a hit that does no damage', () => {
    let s = putOnBoard(fresh(), '0', bubbly);
    s = putOnBoard(s, '1', minionCard('LIMP', { attack: 0, health: 3 }));
    const t = act(s, attack(idOf(s, '0'), mref(idOf(s, '1'))));
    expect(t.players['0'].board[0].keywords.bubble).toBe(true);
  });
  it('can be given to a minion by a spell', () => {
    let s = putOnBoard(withHand('CORE_074'), '0', grunt);
    expect(act(s, play(mref(idOf(s, '0')))).players['0'].board[0].keywords.bubble).toBe(true);
  });
});

describe('Double attack', () => {
  it('allows exactly two attacks per turn, and resets next turn', () => {
    let s = putOnBoard(fresh(), '0', twice);
    const id = idOf(s, '0');
    s = act(s, attack(id, hero1));
    s = act(s, attack(id, hero1));
    expect(s.players['1'].health).toBe(28);
    expect(fail(s, attack(id, hero1))).toBe('MINION_CANT_ATTACK');
    s = endTurn(endTurn(s));
    expect(act(act(s, attack(id, hero1)), attack(id, hero1)).players['1'].health).toBe(26);
  });
  it('can be granted by a spell, even after the minion has attacked once', () => {
    let s = putOnBoard(withHand('CORE_107'), '0', grunt);
    const id = idOf(s, '0');
    s = act(s, attack(id, hero1));
    expect(fail(s, attack(id, hero1))).toBe('MINION_CANT_ATTACK');
    s = act(s, play(mref(id)));
    expect(act(s, attack(id, hero1)).players['1'].health).toBe(26);
  });
});

describe('No attack', () => {
  it('a NO_ATTACK minion never attacks, even with attack power and no summoning sickness', () => {
    const s = putOnBoard(fresh(), '0', pacifist);
    expect(fail(s, attack(idOf(s, '0'), hero1))).toBe('MINION_CANT_ATTACK');
  });
});

describe('Hidden', () => {
  it('cannot be attacked or chosen by a spell', () => {
    let s = putOnBoard(withHand('CORE_044'), '1', ghost);
    s = putOnBoard(s, '0', grunt);
    const g = idOf(s, '1');
    expect(fail(s, attack(idOf(s, '0'), mref(g)))).toBe('ILLEGAL_TARGET');
    expect(fail(s, play(mref(g)))).toBe('ILLEGAL_TARGET');
  });
  it('is revealed by attacking, and can then be targeted', () => {
    let s = putOnBoard(fresh(), '0', ghost);
    s = putOnBoard(s, '1', grunt);
    const id = idOf(s, '0');
    s = act(s, attack(id, hero1));
    expect(s.players['0'].board[0].keywords.hidden).toBe(false);
    s = endTurn(s);
    expect(act(s, attack(idOf(s, '1'), mref(id))).players['0'].board[0].health).toBe(1);
  });
  it('is still hit by area effects, which do not target', () => {
    const s = putOnBoard(withHand('CORE_065'), '1', ghost);
    expect(act(s, play()).players['1'].board[0].health).toBe(2);
  });
  it('is never picked by random targeting', () => {
    let s = putOnBoard(withHand('CORE_063'), '1', ghost);
    const t = act(s, play()); // 5 random enemies, but only the hero is eligible
    expect(t.players['1'].health).toBe(29);
    expect(t.players['1'].board[0].health).toBe(3);
  });
  it('does not count as Guard while hidden', () => {
    let s = putOnBoard(fresh(), '0', grunt);
    s = putOnBoard(s, '1', minionCard('HGUARD', { mechanics: ['BULWARK', 'HIDDEN'] }));
    expect(act(s, attack(idOf(s, '0'), hero1)).players['1'].health).toBe(28);
  });
});

describe('Disable', () => {
  const setup = () => {
    let s = putOnBoard(withHand('CORE_096'), '1', grunt);
    s = putOnBoard(s, '1', grunt);
    return s;
  };
  it("an enemy minion loses its next turn's attack, then recovers", () => {
    let s = act(setup(), play(mref(idOf(setup(), '1', 0))));
    const [a, b] = s.players['1'].board.map((m) => m.instanceId);
    s = endTurn(s); // turn 2, player 1
    expect(fail(s, attack(a, { kind: 'hero', player: '0' }))).toBe('MINION_CANT_ATTACK');
    expect(act(s, attack(b, { kind: 'hero', player: '0' })).players['0'].health).toBe(28);
    s = endTurn(endTurn(s)); // turn 4, player 1 again
    expect(act(s, attack(a, { kind: 'hero', player: '0' })).players['0'].health).toBe(28);
  });
  it('disabling your own minion on your own turn blocks your next turn, not this one', () => {
    let s = putOnBoard(withHand('CORE_096'), '0', grunt);
    const id = idOf(s, '0');
    s = act(s, play(mref(id)));
    expect(act(s, attack(id, hero1)).players['1'].health).toBe(28); // still free to attack this turn
    s = endTurn(endTurn(s)); // turn 3, your next turn
    expect(fail(s, attack(id, hero1))).toBe('MINION_CANT_ATTACK');
    s = endTurn(endTurn(s)); // turn 5
    expect(act(s, attack(id, hero1)).players['1'].health).toBe(28);
  });
  it('an area disable hits every enemy minion', () => {
    let s = putOnBoard(withHand('CORE_068'), '1', grunt);
    s = putOnBoard(s, '1', grunt);
    s = endTurn(act(s, play()));
    for (const m of s.players['1'].board) {
      expect(fail(s, attack(m.instanceId, { kind: 'hero', player: '0' }))).toBe('MINION_CANT_ATTACK');
    }
  });
});

describe('Expiration', () => {
  it('the target dies at the start of the caster next turn, not before', () => {
    let s = putOnBoard(withHand('CORE_114'), '1', grunt);
    s = act(s, play(mref(idOf(s, '1'))));
    expect(s.players['1'].board).toHaveLength(1);
    s = endTurn(s); // P1's turn: still alive
    expect(s.players['1'].board).toHaveLength(1);
    const r = run(s, { type: 'EndTurn' });
    if ('error' in r) throw new Error(r.error);
    expect(r.state.players['1'].board).toHaveLength(0);
    expect(r.events).toContainEqual(expect.objectContaining({ type: 'MinionDied', player: '1' }));
  });
  it('works on your own minions too, and only on the marked one', () => {
    let s = putOnBoard(withHand('CORE_114'), '0', grunt);
    s = putOnBoard(s, '0', grunt);
    const [a, b] = s.players['0'].board.map((m) => m.instanceId);
    s = endTurn(endTurn(act(s, play(mref(a)))));
    expect(s.players['0'].board.map((m) => m.instanceId)).toEqual([b]);
  });
});
