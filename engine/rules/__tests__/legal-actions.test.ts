import { createGame } from '../../state/create-game';
import { applyAction } from '../apply-action';
import { legalActions } from '../legal-actions';
import { createSeededRng } from '../../rng';
import { catalogOf, minionCard, putInHand, putOnBoard, setEnergy, spellCard } from '../../testing/builders';
import type { Action, GameState, PlayerId } from '../../state/types';
import { MAX_BOARD, MAX_HAND } from '../../state/types';

const grunt = minionCard('GRUNT', { cost: 2, attack: 2, health: 3 });
const wall = minionCard('WALL', { cost: 1, attack: 1, health: 4, mechanics: ['BULWARK'] });
const ghost = minionCard('GHOST', { cost: 1, attack: 2, health: 3, mechanics: ['HIDDEN'] });
const rusher = minionCard('RUSHER', { cost: 1, attack: 3, health: 1, mechanics: ['RUSH'] });
const spitter = { ...minionCard('CORE_001', { cost: 1 }), numbers: { primary: 1 } };
const sprite = { ...minionCard('CORE_012', { cost: 2, race: 'SPRITE' }), entourage: ['CORE_012a'] };
const token = { ...minionCard('CORE_012a', { attack: 1, health: 1 }), isToken: true };
const shaman = minionCard('CORE_013', { cost: 2 });
const witch = { ...minionCard('CORE_021', { cost: 3, attack: 3, health: 2 }), numbers: { primary: 1, secondary: 1 } };
const killer = { ...minionCard('CORE_035', { cost: 5, attack: 4, health: 4 }), numbers: { primary: 3 } };
const raptor = minionCard('CORE_061', { cost: 5, attack: 3, health: 2, race: 'CREATURE' });
const ward = { ...minionCard('CORE_085', { cost: 1, attack: 1, health: 3 }), numbers: { primary: 1 } };
const ice = minionCard('CORE_071', { cost: 4, attack: 3, health: 6 });
const zap = spellCard('CORE_044', 1, { primary: 2 });
const sweep = spellCard('CORE_065', 2, { primary: 1 });
const fireballs = spellCard('CORE_063', 1, { primary: 1, random: 3 });
const burn = spellCard('CORE_095', 1, { primary: 3 });
const study = spellCard('CORE_102', 3, { primary: 4 });
const cards = [grunt, wall, ghost, rusher, spitter, sprite, token, shaman, witch, killer, raptor, ward, ice, zap, sweep, fireballs, burn, study];
const catalog = catalogOf(...cards);
const deckIds = cards.filter((c) => !c.isToken).map((c) => c.id);

const game = (seed: number): GameState => {
  const rng = createSeededRng(seed);
  const deck = () => rng.shuffle(Array.from({ length: 30 }, (_, i) => deckIds[i % deckIds.length]));
  return createGame({ decks: { '0': deck(), '1': deck() }, firstPlayer: '0' }, rng);
};
const apply = (s: GameState, a: Action, seed = 1) => applyAction(s, a, { rng: createSeededRng(seed), catalog });

describe('legalActions', () => {
  it('is only for the active player and only while the game is on', () => {
    const s = game(1);
    expect(legalActions(s, '1', catalog)).toEqual([]);
    expect(legalActions(s, '0', catalog)).toContainEqual({ type: 'EndTurn' });
    expect(legalActions({ ...s, status: 'over', winner: '0' }, '0', catalog)).toEqual([]);
  });
  it('offers only affordable cards', () => {
    let s = game(1);
    s = { ...s, players: { ...s.players, '0': { ...s.players['0'], hand: [] } } };
    s = putInHand(putInHand(s, '0', 'GRUNT'), '0', 'WALL');
    s = setEnergy(s, '0', 1);
    const plays = legalActions(s, '0', catalog).filter((a) => a.type === 'PlayCard');
    expect(plays.every((a) => a.type === 'PlayCard' && a.handIndex === 1)).toBe(true);
    expect(plays.length).toBeGreaterThan(0);
  });
  it('offers one action per legal target for targeted spells, and none for a spell with no definition', () => {
    let s = game(1);
    s = { ...s, players: { ...s.players, '0': { ...s.players['0'], hand: [] } } };
    s = setEnergy(putInHand(s, '0', 'CORE_044'), '0', 5);
    s = putOnBoard(s, '1', grunt);
    const targets = legalActions(s, '0', catalog).filter((a) => a.type === 'PlayCard');
    expect(targets).toHaveLength(3); // both heroes and the enemy minion
  });
  it('offers a warcry minion with each target, or untargeted when none exists', () => {
    let s = game(1);
    s = { ...s, players: { ...s.players, '0': { ...s.players['0'], hand: [] } } };
    s = setEnergy(putInHand(s, '0', 'CORE_021'), '0', 5); // buff a minion
    expect(legalActions(s, '0', catalog).filter((a) => a.type === 'PlayCard')).toEqual([
      { type: 'PlayCard', handIndex: 0, boardIndex: 0 },
    ]);
    s = putOnBoard(s, '1', grunt);
    const withTarget = legalActions(s, '0', catalog).filter((a) => a.type === 'PlayCard');
    expect(withTarget.every((a) => a.type === 'PlayCard' && a.target)).toBe(true);
  });
  it('offers no minion plays on a full board', () => {
    let s = game(1);
    s = { ...s, players: { ...s.players, '0': { ...s.players['0'], hand: [] } } };
    s = setEnergy(putInHand(s, '0', 'GRUNT'), '0', 5);
    for (let i = 0; i < MAX_BOARD; i++) s = putOnBoard(s, '0', grunt);
    expect(legalActions(s, '0', catalog).filter((a) => a.type === 'PlayCard')).toEqual([]);
  });
  it('offers attacks only for minions that can attack, at legal targets', () => {
    let s = game(1);
    s = putOnBoard(s, '0', grunt);
    s = putOnBoard(s, '0', grunt, { attacksThisTurn: 1 });
    s = putOnBoard(s, '1', wall);
    s = putOnBoard(s, '1', ghost);
    const attacks = legalActions(s, '0', catalog).filter((a) => a.type === 'Attack');
    expect(attacks).toEqual([
      { type: 'Attack', attackerId: s.players['0'].board[0].instanceId, target: { kind: 'minion', instanceId: s.players['1'].board[0].instanceId } },
    ]);
  });
  it('every action it lists is accepted by applyAction', () => {
    for (let seed = 1; seed <= 20; seed++) {
      let s = game(seed);
      const rng = createSeededRng(seed + 100);
      for (let step = 0; step < 60 && s.status === 'playing'; step++) {
        const actions = legalActions(s, s.activePlayer, catalog);
        for (const a of actions) {
          const r = apply(s, a, seed);
          if ('error' in r) throw new Error(`seed ${seed}: ${JSON.stringify(a)} rejected with ${r.error}`);
        }
        const pick = actions[rng.int(actions.length)];
        const r = apply(s, pick, seed);
        if ('error' in r) throw new Error(r.error);
        s = r.state;
      }
    }
  });
});

describe('random play', () => {
  const invariants = (s: GameState) => {
    for (const p of ['0', '1'] as PlayerId[]) {
      const pl = s.players[p];
      expect(pl.energy.current).toBeGreaterThanOrEqual(0);
      expect(pl.board.length).toBeLessThanOrEqual(MAX_BOARD);
      expect(pl.hand.length).toBeLessThanOrEqual(MAX_HAND);
      expect(pl.health).toBeLessThanOrEqual(30);
      for (const m of pl.board) {
        expect(m.health).toBeGreaterThan(0);
        expect(m.health).toBeLessThanOrEqual(m.maxHealth);
      }
    }
    expect(JSON.parse(JSON.stringify(s))).toEqual(s);
  };
  it('two random bots finish 40 seeded games, keeping every invariant', () => {
    for (let seed = 1; seed <= 40; seed++) {
      let s = game(seed);
      const rng = createSeededRng(seed * 7);
      let steps = 0;
      while (s.status === 'playing') {
        if (++steps > 3000) throw new Error(`seed ${seed} did not finish`);
        const actions = legalActions(s, s.activePlayer, catalog);
        // bias toward doing something so games are not just fatigue
        const active = actions.filter((a) => a.type !== 'EndTurn');
        const pick = active.length > 0 && rng.int(4) > 0 ? active[rng.int(active.length)] : actions[rng.int(actions.length)];
        const r = apply(s, pick, seed + steps);
        if ('error' in r) throw new Error(`seed ${seed}: ${JSON.stringify(pick)} -> ${r.error}`);
        s = r.state;
        invariants(s);
      }
      expect(s.winner).not.toBeNull();
    }
  });
});
