import { getCardDef } from '..';
import { legalActions } from '../../rules/legal-actions';
import { catalog, failCode, mref, play, realCard, setup, stats } from '../../testing/real-cards';

// CORE_135 warcry: destroy an enemy minion with 7 or more attack power.
describe('CORE_135', () => {
  it('is defined', () => {
    expect(getCardDef(realCard('CORE_135'))).toBeDefined();
  });
  it('destroys an enemy minion with 7 or more attack, and only lets those be aimed at', () => {
    const s = setup('CORE_135', { theirs: [[6, 6], [7, 3]] });
    expect(failCode(s, mref(s, '1', 0))).toBe('ILLEGAL_TARGET');
    expect(stats(play(s, mref(s, '1', 1)).state, '1')).toEqual([[6, 6]]);
  });
  it('cannot aim at your own 7+ attack minion: with only that one around it is just an ordinary play', () => {
    const s = setup('CORE_135', { mine: [[9, 9]] });
    expect(failCode(s, mref(s, '0', 0))).toBe('ILLEGAL_TARGET');
    const plays = legalActions(s, '0', catalog).filter((a) => a.type === 'PlayCard' && a.handIndex === 0);
    expect(plays.length).toBeGreaterThan(0);
    expect(plays.every((a) => a.type === 'PlayCard' && !a.target)).toBe(true);
    expect(stats(play(s).state, '0')).toEqual([[9, 9], [4, 2]]);
  });
  it('with nothing to aim at it plays like an ordinary minion: no target, placed on the board, warcry does nothing', () => {
    const s = setup('CORE_135', { theirs: [[6, 6]], mine: [[2, 2]] });
    const plays = legalActions(s, '0', catalog).filter((a) => a.type === 'PlayCard' && a.handIndex === 0);
    expect(plays.length).toBeGreaterThan(0);
    expect(plays.every((a) => a.type === 'PlayCard' && !a.target && a.boardIndex !== undefined)).toBe(true);
    const r = play(s).state;
    expect(stats(r, '0')).toHaveLength(2); // the grunt and the Slayer
    expect(stats(r, '1')).toEqual([[6, 6]]);
  });
  it('with a 7+ attack minion on the board every play of it is aimed at one', () => {
    const s = setup('CORE_135', { theirs: [[7, 3]] });
    const plays = legalActions(s, '0', catalog).filter((a) => a.type === 'PlayCard' && a.handIndex === 0);
    expect(plays.length).toBeGreaterThan(0);
    expect(plays.every((a) => a.type === 'PlayCard' && !!a.target)).toBe(true);
  });
});
