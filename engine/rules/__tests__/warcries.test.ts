import { createGame } from '../../state/create-game';
import { applyAction } from '../apply-action';
import { createSeededRng } from '../../rng';
import { catalogOf, minionCard, putInHand, putOnBoard, setEnergy, spellCard } from '../../testing/builders';
import { produce } from 'immer';
import type { CardDef } from '../../definitions/define-card';
import { getCardDef } from '../../definitions';
import { heal } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyCharacter } from '../../effects/filters';
import type { Card } from '../../cards/types';
import type { Action, ActionErrorCode, GameEvent, GameState, TargetRef } from '../../state/types';

// Real definitions, fabricated stats. T_HEAL is test-only (no CORE spell uses heal yet).
const testDefs: Record<string, CardDef> = {
  T_HEAL: { target: anyCharacter(), onPlay: [heal(chosenTarget(), 2)] },
};
const defs = (card: Card) => testDefs[card.id] ?? getCardDef(card);

const grunt = minionCard('GRUNT', { cost: 2, attack: 2, health: 3 });
const spitter = { ...minionCard('CORE_001', { cost: 1 }), numbers: { primary: 1 } };
const spriteSupport = { ...minionCard('CORE_012', { cost: 2, race: 'SPRITE' }), entourage: ['CORE_012a'] };
const spriteToken = { ...minionCard('CORE_012a', { attack: 1, health: 1, race: 'SPRITE' }), isToken: true };
const shaman = minionCard('CORE_013', { cost: 2 });
const witch = { ...minionCard('CORE_021', { cost: 3, attack: 3, health: 2 }), numbers: { primary: 1, secondary: 1 } };
const killer = { ...minionCard('CORE_035', { cost: 5, attack: 4, health: 4 }), numbers: { primary: 3 } };
const raptor = minionCard('CORE_061', { cost: 5, attack: 3, health: 2, race: 'CREATURE' });
const iceman = minionCard('CORE_071', { cost: 4, attack: 3, health: 6, race: 'ELEMENT' });
const ward = { ...minionCard('CORE_085', { cost: 1, attack: 1, health: 3 }), numbers: { primary: 1 } };
const critter = minionCard('CRITTER', { cost: 1, attack: 1, health: 1, race: 'CREATURE' });
const heals = spellCard('T_HEAL', 1);
const catalog = catalogOf(grunt, spitter, spriteSupport, spriteToken, shaman, witch, killer, raptor, iceman, ward, critter, heals);

const fresh = (): GameState =>
  createGame(
    { decks: { '0': Array(30).fill('GRUNT'), '1': Array(30).fill('GRUNT') }, firstPlayer: '0' },
    createSeededRng(1)
  );
const run = (s: GameState, a: Action) => applyAction(s, a, { rng: createSeededRng(1), catalog, defs });
const act = (s: GameState, a: Action): GameState => {
  const r = run(s, a);
  if ('error' in r) throw new Error(`unexpected ${r.error}`);
  return r.state;
};
const events = (s: GameState, a: Action): GameEvent[] => {
  const r = run(s, a);
  if ('error' in r) throw new Error(r.error);
  return r.events;
};
const fail = (s: GameState, a: Action): ActionErrorCode => {
  const r = run(s, a);
  if (!('error' in r)) throw new Error('expected an error');
  return r.error;
};
const withHand = (...ids: string[]): GameState => {
  let s = fresh();
  s = { ...s, players: { ...s.players, '0': { ...s.players['0'], hand: [] } } };
  for (const id of ids) s = putInHand(s, '0', id);
  return setEnergy(s, '0', 10);
};
const play = (handIndex = 0, target?: TargetRef, boardIndex?: number): Action => ({ type: 'PlayCard', handIndex, target, boardIndex });
const mref = (instanceId: number): TargetRef => ({ kind: 'minion', instanceId });
const idOf = (s: GameState, p: '0' | '1', i = 0) => s.players[p].board[i].instanceId;

describe('warcries', () => {
  it('place the minion first, then run the warcry on the chosen target', () => {
    const s = putOnBoard(withHand('CORE_001'), '1', grunt);
    const a = play(0, mref(idOf(s, '1')));
    const t = act(s, a);
    expect(t.players['0'].board[0].cardId).toBe('CORE_001');
    expect(t.players['1'].board[0].health).toBe(2);
    expect(t.players['0'].energy.current).toBe(9);
    const types = events(s, a).map((e) => e.type);
    expect(types.indexOf('MinionPlayed')).toBeLessThan(types.indexOf('MinionDamaged'));
  });
  it('a warcry that kills settles at once', () => {
    const s = putOnBoard(withHand('CORE_001'), '1', minionCard('LOW', { health: 1 }));
    expect(act(s, play(0, mref(idOf(s, '1')))).players['1'].board).toHaveLength(0);
  });
  it('requires a legal target when one exists, and rejects a target when none is asked for', () => {
    const s = putOnBoard(withHand('CORE_001', 'CORE_013'), '1', grunt);
    expect(fail(s, play(0))).toBe('ILLEGAL_TARGET');
    expect(fail(s, play(0, mref(9999)))).toBe('ILLEGAL_TARGET');
    expect(fail(s, play(1, mref(idOf(s, '1'))))).toBe('ILLEGAL_TARGET');
  });
  it('with no legal target the minion is still played and the warcry does nothing', () => {
    const s = withHand('CORE_021'); // buff a minion, but no minions are in play
    const t = act(s, play());
    expect(t.players['0'].board).toHaveLength(1);
    expect(t.players['0'].board[0]).toMatchObject({ attack: 3, health: 2 });
    expect(fail(s, play(0, mref(1)))).toBe('ILLEGAL_TARGET');
  });
  it('buffs add attack, health and maximum health', () => {
    const s = putOnBoard(withHand('CORE_021'), '0', grunt);
    const t = act(s, play(0, mref(idOf(s, '0'))));
    expect(t.players['0'].board.find((m) => m.cardId === 'GRUNT')).toMatchObject({ attack: 3, health: 4, maxHealth: 4 });
  });
  it('global warcries need no target', () => {
    expect(act(withHand('CORE_035'), play()).players['1'].health).toBe(27);
    const h = withHand('CORE_013');
    expect(act(h, play()).players['0'].hand).toHaveLength(1);
  });
  it('summon a token beside the minion, and fizzle on a full board', () => {
    const t = act(withHand('CORE_012'), play());
    expect(t.players['0'].board.map((m) => m.cardId)).toEqual(['CORE_012', 'CORE_012a']);
    // With another minion to its right, the token goes directly beside the summoner, not at the end.
    const crowded = act(putOnBoard(withHand('CORE_012'), '0', grunt), play(0, undefined, 0));
    expect(crowded.players['0'].board.map((m) => m.cardId)).toEqual(['CORE_012', 'CORE_012a', 'GRUNT']);
    let full = withHand('CORE_012');
    for (let i = 0; i < 6; i++) full = putOnBoard(full, '0', grunt);
    const f = act(full, play());
    expect(f.players['0'].board).toHaveLength(7);
    expect(f.players['0'].board.some((m) => m.cardId === 'CORE_012a')).toBe(false);
  });
  it('a summoned token is summoning sick and gets its own play order', () => {
    const t = act(withHand('CORE_012'), play());
    const [m, token] = t.players['0'].board;
    expect(token.playedOnTurn).toBe(t.turn);
    expect(token.playSeq).toBeGreaterThan(m.playSeq);
  });
});

describe('Ancient Raptor (draw on summoning a Creature)', () => {
  const withRaptor = (...hand: string[]) => putOnBoard(withHand(...hand), '0', raptor);
  it('draws when you play a Creature, not for other races', () => {
    const s = withRaptor('CRITTER', 'GRUNT');
    const before = s.players['0'].hand.length; // 2
    expect(act(s, play(0)).players['0'].hand).toHaveLength(before - 1 + 1);
    expect(act(s, play(1)).players['0'].hand).toHaveLength(before - 1);
  });
  it("does not trigger on the opponent's Creatures, or on itself", () => {
    // Played with no other Raptor in play, a Raptor does not draw for itself.
    expect(act(withHand('CORE_061'), play(0)).players['0'].hand).toHaveLength(0);
    // A second Raptor is a Creature too, so the first one does draw for it.
    expect(act(withRaptor('CORE_061'), play(0)).players['0'].hand).toHaveLength(1);
    let o = withRaptor();
    o = produce(o, (g) => void g.players['1'].hand.push({ instanceId: 777, cardId: 'CRITTER' }));
    const mine = act(o, { type: 'EndTurn' });
    const theirs = act(mine, { type: 'PlayCard', handIndex: mine.players['1'].hand.findIndex((c) => c.cardId === 'CRITTER') });
    expect(theirs.players['0'].hand).toHaveLength(mine.players['0'].hand.length);
  });
  it('triggers on tokens it summons beside it', () => {
    let s = withRaptor('CORE_012');
    s = putOnBoard(s, '0', { ...spriteSupport, race: 'CREATURE' }); // just to have a Creature-tagged summoner
    const t = act(s, play(0));
    expect(t.players['0'].hand).toHaveLength(0);
  });
});

describe('Ifriit Ward (draw whenever a minion is healed)', () => {
  it('draws when a damaged minion is healed, whoever owns it', () => {
    let s = putOnBoard(withHand('T_HEAL'), '0', ward);
    s = putOnBoard(s, '1', grunt, { health: 1 });
    const t = act(s, play(0, mref(idOf(s, '1'))));
    expect(t.players['0'].hand).toHaveLength(1);
  });
  it('does not draw when nothing was restored, or for a hero', () => {
    let s = putOnBoard(withHand('T_HEAL'), '0', ward);
    s = putOnBoard(s, '1', grunt);
    expect(act(s, play(0, mref(idOf(s, '1')))).players['0'].hand).toHaveLength(0);
    const h = produce(s, (g) => void (g.players['1'].health = 10));
    expect(act(h, play(0, { kind: 'hero', player: '1' })).players['0'].hand).toHaveLength(0);
  });
});

describe('Ice Primordial (disable whoever it attacks)', () => {
  it("the attacked minion misses its owner's next attack, and heroes are unaffected", () => {
    let s = putOnBoard(fresh(), '0', iceman);
    s = putOnBoard(s, '1', minionCard('V', { attack: 1, health: 9 }));
    const victim = idOf(s, '1');
    s = act(s, { type: 'Attack', attackerId: idOf(s, '0'), target: mref(victim) });
    s = act(s, { type: 'EndTurn' });
    expect(fail(s, { type: 'Attack', attackerId: victim, target: { kind: 'hero', player: '0' } })).toBe('MINION_CANT_ATTACK');
    const solo = putOnBoard(fresh(), '0', iceman);
    const h = act(solo, { type: 'Attack', attackerId: idOf(solo, '0'), target: { kind: 'hero', player: '1' } });
    expect(h.players['1'].health).toBe(27);
  });
});
