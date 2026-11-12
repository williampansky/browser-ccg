import { isDamaged, MINION_OVAL_MAX, MINION_OVAL_MIN, minionOvalHeight, statTone, statusBadges } from '../minion-model';
import type { MinionInstance } from '../../../engine';

const base = (over: Partial<MinionInstance> = {}, keywords: Partial<MinionInstance['keywords']> = {}): MinionInstance => ({
  instanceId: 1,
  cardId: 'X',
  attack: 2,
  health: 3,
  maxHealth: 3,
  playedOnTurn: 1,
  attacksThisTurn: 0,
  playSeq: 1,
  auraAttack: 0,
  auraRush: false,
  tempAttack: 0,
  keywords: { guard: false, rush: false, bubble: false, doubleAttack: false, hidden: false, noAttack: false, ...keywords },
  ...over,
});

describe('statusBadges', () => {
  it('a plain minion has none', () => expect(statusBadges(base(), 5, false)).toEqual([]));
  it('Guard, Bubble and Concealed are drawn on the whole minion, so they are not icons', () => {
    expect(statusBadges(base({}, { guard: true, bubble: true, hidden: true }), 5, false)).toEqual([]);
  });
  it('lists Stampede, Onslaught and Can\'t attack in a fixed order', () => {
    const kinds = statusBadges(base({}, { noAttack: true, doubleAttack: true, rush: true }), 5, false).map((b) => b.kind);
    expect(kinds).toEqual(['rush', 'onslaught', 'noAttack']);
  });
  it('Disabled shows through its owner\'s next turn only', () => {
    expect(statusBadges(base({ disabledOnTurn: 6 }), 5, false).map((b) => b.kind)).toEqual(['disabled']);
    expect(statusBadges(base({ disabledOnTurn: 5 }), 5, false).map((b) => b.kind)).toEqual(['disabled']);
    expect(statusBadges(base({ disabledOnTurn: 4 }), 5, false)).toEqual([]);
  });
  it('shows Expiring, Suppressed and not-ready', () => {
    expect(statusBadges(base({ expiresOnTurn: 7, silenced: true }), 5, true).map((b) => b.kind)).toEqual(['expiring', 'silenced', 'asleep']);
  });
});

describe('statTone and isDamaged', () => {
  it('compares a stat with the printed number', () => {
    expect(statTone(5, 3)).toBe('up');
    expect(statTone(1, 3)).toBe('down');
    expect(statTone(3, 3)).toBe('same');
    expect(statTone(3, undefined)).toBe('same');
  });
  it('is damaged below its maximum Health only', () => {
    expect(isDamaged({ health: 2, maxHealth: 3 })).toBe(true);
    expect(isDamaged({ health: 3, maxHealth: 3 })).toBe(false);
    expect(isDamaged({ health: 5, maxHealth: 3 })).toBe(false);
  });
});

describe('minionOvalHeight', () => {
  it('is full size when the board is wide, smaller as it narrows, never below the minimum', () => {
    expect(minionOvalHeight(2000)).toBe(MINION_OVAL_MAX);
    expect(minionOvalHeight(992)).toBe(MINION_OVAL_MAX);
    expect(minionOvalHeight(764)).toBeLessThan(MINION_OVAL_MAX);
    expect(minionOvalHeight(100)).toBe(MINION_OVAL_MIN);
    expect(minionOvalHeight(0)).toBe(MINION_OVAL_MAX); // not measured yet
  });
  it('seven minions always fit the row when the board is at least a moderate width', () => {
    for (const width of [600, 700, 764, 900, 1100]) {
      const h = minionOvalHeight(width);
      const slot = h / 1.25 + 26;
      if (h > MINION_OVAL_MIN) expect(7 * slot + 6 * 4).toBeLessThanOrEqual(width + 1);
    }
  });
});
