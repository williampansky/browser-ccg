import { produce } from 'immer';
import { isPlayable } from '../../decks';
import { legalActions } from '../../rules/legal-actions';
import {
  catalog,
  failCode,
  hero,
  legalTargets,
  mref,
  realCard,
  run,
  setup,
  stats,
} from '../../testing/real-cards';
import type { Action, GameState, TargetRef } from '../../state/types';

// "Choose one" cards: the player picks an option (`choice`) as part of PlayCard, then a target if
// that option needs one.

const playChoice = (s: GameState, choice: number | undefined, target?: TargetRef) => {
  const r = run(s, { type: 'PlayCard', handIndex: 0, choice, target } as Action);
  if ('error' in r) throw new Error(`unexpected ${r.error}`);
  return r.state;
};
const codeFor = (s: GameState, choice: number | undefined, target?: TargetRef) => {
  const r = run(s, { type: 'PlayCard', handIndex: 0, choice, target } as Action);
  return 'error' in r ? r.error : undefined;
};

describe('choose-one plumbing', () => {
  it.each(['CORE_045', 'CORE_051', 'CORE_055'])('%s is playable', (id) => {
    expect(isPlayable(realCard(id))).toBe(true);
  });
  it('a choose-one card needs a valid choice', () => {
    const s = setup('CORE_045', { theirs: [[1, 5]] });
    expect(codeFor(s, undefined, hero('1'))).toBe('BAD_CHOICE');
    expect(codeFor(s, 2, hero('1'))).toBe('BAD_CHOICE');
    expect(codeFor(s, -1)).toBe('BAD_CHOICE');
    expect(codeFor(s, 0.5)).toBe('BAD_CHOICE');
  });
  it('a normal card refuses a choice', () => {
    expect(codeFor(setup('CORE_053', { theirs: [[1, 5]] }), 0)).toBe('BAD_CHOICE');
    expect(failCode(setup('CORE_053'))).toBe('ILLEGAL_TARGET');
  });
});

describe('CORE_045: deal 1 damage OR gain 1 armor', () => {
  it('option 0 deals 1 to a chosen character and needs a target', () => {
    const s = setup('CORE_045', { theirs: [[1, 5]] });
    expect(stats(playChoice(s, 0, mref(s, '1', 0)), '1')[0][1]).toBe(4);
    expect(playChoice(s, 0, hero('1')).players['1'].health).toBe(29);
    expect(codeFor(s, 0)).toBe('ILLEGAL_TARGET');
  });
  it('option 1 gains 1 armor and takes no target', () => {
    const s = setup('CORE_045', { theirs: [[1, 5]] });
    expect(playChoice(s, 1).players['0'].armor).toBe(1);
    expect(codeFor(s, 1, hero('1'))).toBe('ILLEGAL_TARGET');
  });
  it('legalTargets and legalActions follow the chosen option', () => {
    const s = setup('CORE_045', { theirs: [[1, 5]] });
    expect(legalTargets(s, { kind: 'card', handIndex: 0, choice: 1 }, catalog)).toEqual([]);
    expect(legalTargets(s, { kind: 'card', handIndex: 0, choice: 0 }, catalog)).toHaveLength(3);
    const plays = legalActions(s, '0', catalog).filter((a) => a.type === 'PlayCard') as Extract<Action, { type: 'PlayCard' }>[];
    expect(plays.filter((a) => a.choice === 0)).toHaveLength(3); // both heroes + the enemy minion
    expect(plays.filter((a) => a.choice === 1)).toEqual([{ type: 'PlayCard', handIndex: 0, choice: 1 }]);
    for (const a of plays) expect('error' in run(s, a)).toBe(false); // every offered action is accepted
  });
});

describe("CORE_051 Nature's Wrath: 5 damage OR 2 damage and draw a card", () => {
  it('option 0 deals 5, no card', () => {
    const s = setup('CORE_051', { theirs: [[1, 9]] });
    const r = playChoice(s, 0, mref(s, '1', 0));
    expect(stats(r, '1')[0][1]).toBe(4);
    expect(r.players['0'].hand).toHaveLength(0);
  });
  it('option 1 deals 2 and draws a card', () => {
    const s = setup('CORE_051', { theirs: [[1, 9]] });
    const r = playChoice(s, 1, mref(s, '1', 0));
    expect(stats(r, '1')[0][1]).toBe(7);
    expect(r.players['0'].hand).toHaveLength(1);
  });
});

describe('CORE_055 Surveying Drone: draw the next 3, keep 1, discard the others', () => {
  const withDeck = (ids: string[], handExtra: number[] = []): GameState => {
    const s = setup('CORE_055');
    return produce(s, (g) => {
      g.players['0'].deck = ids.map((cardId, i) => ({ instanceId: 5000 + i, cardId }));
      for (const i of handExtra) g.players['0'].hand.push({ instanceId: 6000 + i, cardId: 'GRUNT' });
    });
  };
  it('offers three options and keeps exactly the one chosen', () => {
    const s = withDeck(['CORE_001', 'CORE_002', 'CORE_003', 'CORE_004']);
    for (const [choice, kept] of [[0, 'CORE_001'], [1, 'CORE_002'], [2, 'CORE_003']] as const) {
      const r = playChoice(s, choice);
      expect(r.players['0'].hand.map((c) => c.cardId)).toEqual([kept]);
      expect(r.players['0'].deck.map((c) => c.cardId)).toEqual(['CORE_004']); // the other two are gone
    }
    expect(codeFor(s, 3)).toBe('BAD_CHOICE');
  });
  it('with a full hand the kept card is burned', () => {
    const s = withDeck(['CORE_001', 'CORE_002', 'CORE_003'], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    const r = playChoice(s, 0);
    expect(r.players['0'].hand).toHaveLength(10);
    expect(r.players['0'].deck).toHaveLength(0);
  });
  it('with fewer than 3 cards left, choosing past the end keeps the last card; empty deck does nothing', () => {
    const two = withDeck(['CORE_001', 'CORE_002']);
    expect(playChoice(two, 2).players['0'].hand.map((c) => c.cardId)).toEqual(['CORE_002']);
    const none = playChoice(withDeck([]), 0);
    expect(none.players['0'].hand).toHaveLength(0);
    expect(none.players['0'].fatigue).toBe(0); // looking at an empty deck is not a draw
  });
});
