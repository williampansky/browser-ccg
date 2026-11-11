import { createGame } from '../../state/create-game';
import { applyAction } from '../apply-action';
import { createSeededRng } from '../../rng';
import { catalogOf, minionCard, putInHand, putOnBoard, setEnergy, spellCard } from '../../testing/builders';
import type { Action, ActionErrorCode, GameState } from '../../state/types';

const grunt = minionCard('GRUNT', { cost: 2, attack: 2, health: 3 });
const wall = minionCard('WALL', { cost: 1, attack: 1, health: 4, mechanics: ['BULWARK'] });
const charger = minionCard('CHARGER', { cost: 1, attack: 3, health: 1, mechanics: ['RUSH'] });
const dud = minionCard('DUD', { cost: 1, attack: 0, health: 5 });
const bolt = spellCard('BOLT');
const catalog = catalogOf(grunt, wall, charger, dud, bolt);

const fresh = (): GameState =>
  createGame(
    { decks: { '0': Array(30).fill('GRUNT'), '1': Array(30).fill('GRUNT') }, firstPlayer: '0' },
    createSeededRng(1)
  );
const act = (s: GameState, a: Action): GameState => {
  const r = applyAction(s, a, { rng: createSeededRng(1), catalog });
  if ('error' in r) throw new Error(`unexpected ${r.error}`);
  return r.state;
};
const fail = (s: GameState, a: Action): ActionErrorCode => {
  const r = applyAction(s, a, { rng: createSeededRng(1), catalog });
  if (!('error' in r)) throw new Error('expected an error');
  return r.error;
};
const endTurn = (s: GameState) => act(s, { type: 'EndTurn' });
/** P0 to move on turn 1, hand replaced by exactly these cards, plenty of energy. */
const withHand = (...ids: string[]): GameState => {
  let s = fresh();
  s = { ...s, players: { ...s.players, '0': { ...s.players['0'], hand: [] } } };
  for (const id of ids) s = putInHand(s, '0', id);
  return setEnergy(s, '0', 10);
};
const attackHero = (attackerId: number): Action => ({ type: 'Attack', attackerId, target: { kind: 'hero' } });
const attackMinion = (attackerId: number, instanceId: number): Action => ({
  type: 'Attack',
  attackerId,
  target: { kind: 'minion', instanceId },
});

describe('PlayCard (minions)', () => {
  it('moves the minion from hand to board and spends energy', () => {
    const s = act(withHand('GRUNT'), { type: 'PlayCard', handIndex: 0 });
    expect(s.players['0'].hand).toHaveLength(0);
    expect(s.players['0'].energy.current).toBe(8);
    expect(s.players['0'].board).toHaveLength(1);
    expect(s.players['0'].board[0]).toMatchObject({
      cardId: 'GRUNT',
      attack: 2,
      health: 3,
      maxHealth: 3,
      playedOnTurn: 1,
      attacksThisTurn: 0,
    });
  });
  it('copies keywords from the card mechanics', () => {
    const s = act(withHand('WALL'), { type: 'PlayCard', handIndex: 0 });
    expect(s.players['0'].board[0].keywords).toMatchObject({ guard: true, rush: false });
  });
  it('inserts at boardIndex and shifts the rest right', () => {
    let s = withHand('GRUNT', 'WALL', 'DUD');
    s = act(s, { type: 'PlayCard', handIndex: 0 });
    s = act(s, { type: 'PlayCard', handIndex: 0 }); // WALL at end
    s = act(s, { type: 'PlayCard', handIndex: 0, boardIndex: 1 }); // DUD between
    expect(s.players['0'].board.map((m) => m.cardId)).toEqual(['GRUNT', 'DUD', 'WALL']);
  });
  it('rejects what it cannot afford and leaves the state alone', () => {
    const s = setEnergy(withHand('GRUNT'), '0', 1);
    expect(fail(s, { type: 'PlayCard', handIndex: 0 })).toBe('CANT_AFFORD');
  });
  it('rejects a bad hand or board index', () => {
    const s = withHand('GRUNT');
    expect(fail(s, { type: 'PlayCard', handIndex: 1 })).toBe('BAD_HAND_INDEX');
    expect(fail(s, { type: 'PlayCard', handIndex: -1 })).toBe('BAD_HAND_INDEX');
    expect(fail(s, { type: 'PlayCard', handIndex: 0, boardIndex: 1 })).toBe('BAD_BOARD_INDEX');
    expect(fail(s, { type: 'PlayCard', handIndex: 0, boardIndex: -1 })).toBe('BAD_BOARD_INDEX');
  });
  it('rejects a play onto a full board of 7', () => {
    let s = withHand('GRUNT');
    for (let i = 0; i < 7; i++) s = putOnBoard(s, '0', grunt);
    expect(fail(s, { type: 'PlayCard', handIndex: 0 })).toBe('BOARD_FULL');
  });
  it('reports a card it has no definition for, and spells as unsupported for now', () => {
    expect(fail(putInHand(withHand(), '0', 'NOPE'), { type: 'PlayCard', handIndex: 0 })).toBe('UNKNOWN_CARD');
    expect(fail(withHand('BOLT'), { type: 'PlayCard', handIndex: 0 })).toBe('UNSUPPORTED_CARD');
  });
});

describe('summoning sickness and attack limits', () => {
  const played = () => {
    const s = act(withHand('GRUNT'), { type: 'PlayCard', handIndex: 0 });
    return { s, id: s.players['0'].board[0].instanceId };
  };
  it('a new minion cannot attack the turn it is played', () => {
    const { s, id } = played();
    expect(fail(s, attackHero(id))).toBe('MINION_CANT_ATTACK');
  });
  it('it can attack on its owner next turn', () => {
    const { s, id } = played();
    const next = endTurn(endTurn(s));
    expect(act(next, attackHero(id)).players['1'].health).toBe(28);
  });
  it('a minion attacks once per turn, and attack counts reset next turn', () => {
    const { s, id } = played();
    let t = endTurn(endTurn(s));
    t = act(t, attackHero(id));
    expect(fail(t, attackHero(id))).toBe('MINION_CANT_ATTACK');
    t = endTurn(endTurn(t));
    expect(act(t, attackHero(id)).players['1'].health).toBe(26);
  });
  it('Rush attacks at once, and can hit the hero', () => {
    const s = act(withHand('CHARGER'), { type: 'PlayCard', handIndex: 0 });
    const id = s.players['0'].board[0].instanceId;
    expect(act(s, attackHero(id)).players['1'].health).toBe(27);
  });
  it('a 0-attack minion cannot attack', () => {
    const s = putOnBoard(fresh(), '0', dud);
    expect(fail(s, attackHero(s.players['0'].board[0].instanceId))).toBe('MINION_CANT_ATTACK');
  });
  it('cannot attack with an enemy or unknown minion', () => {
    let s = putOnBoard(fresh(), '1', grunt);
    expect(fail(s, attackHero(s.players['1'].board[0].instanceId))).toBe('UNKNOWN_ATTACKER');
    expect(fail(s, attackHero(9999))).toBe('UNKNOWN_ATTACKER');
  });
});

describe('combat', () => {
  const duel = (a: Parameters<typeof minionCard>[1], d: Parameters<typeof minionCard>[1]) => {
    let s = putOnBoard(fresh(), '0', minionCard('A', a));
    s = putOnBoard(s, '1', minionCard('D', d));
    return { s, a: s.players['0'].board[0].instanceId, d: s.players['1'].board[0].instanceId };
  };
  it('both minions take the other attack at the same time', () => {
    const { s, a, d } = duel({ attack: 2, health: 5 }, { attack: 3, health: 5 });
    const t = act(s, attackMinion(a, d));
    expect(t.players['0'].board[0]).toMatchObject({ health: 2 });
    expect(t.players['1'].board[0]).toMatchObject({ health: 3 });
    expect(t.players['0'].board[0].attacksThisTurn).toBe(1);
  });
  it('a trade kills both and removes them from the boards', () => {
    const { s, a, d } = duel({ attack: 3, health: 3 }, { attack: 3, health: 3 });
    const r = applyAction(s, attackMinion(a, d), { rng: createSeededRng(1), catalog });
    if ('error' in r) throw new Error(r.error);
    expect(r.state.players['0'].board).toHaveLength(0);
    expect(r.state.players['1'].board).toHaveLength(0);
    expect(r.events.filter((e) => e.type === 'MinionDied')).toHaveLength(2);
  });
  it('only the loser dies when attack beats health; the board stays dense', () => {
    let s = putOnBoard(fresh(), '1', minionCard('X', { health: 5 }));
    s = putOnBoard(s, '1', minionCard('Y', { health: 1 }));
    s = putOnBoard(s, '1', minionCard('Z', { health: 5 }));
    s = putOnBoard(s, '0', minionCard('A', { attack: 4, health: 9 }));
    const [x, y, z] = s.players['1'].board.map((m) => m.instanceId);
    const t = act(s, attackMinion(s.players['0'].board[0].instanceId, y));
    expect(t.players['1'].board.map((m) => m.instanceId)).toEqual([x, z]);
    expect(t.players['0'].board[0].health).toBe(8);
  });
  it('cannot attack your own minion or a missing one', () => {
    let s = putOnBoard(fresh(), '0', grunt);
    s = putOnBoard(s, '0', grunt);
    const [a, b] = s.players['0'].board.map((m) => m.instanceId);
    expect(fail(s, attackMinion(a, b))).toBe('ILLEGAL_TARGET');
    expect(fail(s, attackMinion(a, 9999))).toBe('ILLEGAL_TARGET');
  });
  it('hitting the hero drains armor first, with no counter-damage', () => {
    let s = putOnBoard(fresh(), '0', minionCard('A', { attack: 4, health: 2 }));
    s = { ...s, players: { ...s.players, '1': { ...s.players['1'], armor: 3 } } };
    const t = act(s, attackHero(s.players['0'].board[0].instanceId));
    expect(t.players['1']).toMatchObject({ armor: 0, health: 29 });
    expect(t.players['0'].board[0].health).toBe(2);
  });
  it('lethal damage to the hero ends the game', () => {
    let s = putOnBoard(fresh(), '0', minionCard('A', { attack: 4, health: 2 }));
    s = { ...s, players: { ...s.players, '1': { ...s.players['1'], health: 4 } } };
    const t = act(s, attackHero(s.players['0'].board[0].instanceId));
    expect(t).toMatchObject({ status: 'over', winner: '0' });
  });
  it('does not mutate its input', () => {
    const { s, a, d } = duel({ attack: 3, health: 3 }, { attack: 3, health: 3 });
    const snap = JSON.stringify(s);
    act(s, attackMinion(a, d));
    expect(JSON.stringify(s)).toBe(snap);
  });
});

describe('Guard', () => {
  const setup = () => {
    let s = putOnBoard(fresh(), '0', grunt);
    s = putOnBoard(s, '1', grunt);
    s = putOnBoard(s, '1', wall);
    return {
      s,
      a: s.players['0'].board[0].instanceId,
      plain: s.players['1'].board[0].instanceId,
      guard: s.players['1'].board[1].instanceId,
    };
  };
  it('only Guard minions may be attacked while one is present', () => {
    const { s, a, plain, guard } = setup();
    expect(fail(s, attackMinion(a, plain))).toBe('ILLEGAL_TARGET');
    expect(fail(s, attackHero(a))).toBe('ILLEGAL_TARGET');
    expect(act(s, attackMinion(a, guard)).players['1'].board.find((m) => m.instanceId === guard)?.health).toBe(2);
  });
  it('the hero and other minions are open again once the Guard dies', () => {
    const { s, a, plain, guard } = setup();
    const weak = { ...s, players: { ...s.players, '1': { ...s.players['1'], board: s.players['1'].board.map((m) => (m.instanceId === guard ? { ...m, health: 1 } : m)) } } };
    const t = act(weak, attackMinion(a, guard));
    const b = putOnBoard(t, '0', grunt);
    const b2 = b.players['0'].board[1].instanceId;
    expect(act(b, attackHero(b2)).players['1'].health).toBe(28);
    expect(plain).toBeDefined();
  });
  it('does not restrict your own targets, and a Guard can itself attack anything unguarded', () => {
    let s = putOnBoard(fresh(), '0', wall);
    s = putOnBoard(s, '1', grunt);
    const g = s.players['0'].board[0].instanceId;
    expect(act(s, attackHero(g)).players['1'].health).toBe(29);
  });
});
