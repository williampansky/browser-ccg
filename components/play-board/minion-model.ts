import type { MinionInstance } from '../../engine';

/** A small status icon on a board minion. `kind` picks the glyph and colour, `label` is the words for a tooltip or a screen reader. */
export interface StatusBadge {
  kind: 'rush' | 'onslaught' | 'disabled' | 'expiring' | 'asleep' | 'noAttack' | 'silenced';
  label: string;
}

/**
 * The status icons a minion shows. Guard, Bubble and Concealed are NOT here: they change how the whole minion is drawn (a shield behind it,
 * a ring around it, a veil over it). `sick` is summoning sickness (it cannot attack yet); only the viewer's own minions show it.
 */
export const statusBadges = (m: MinionInstance, turn: number, sick: boolean): StatusBadge[] => {
  const out: StatusBadge[] = [];
  if (m.keywords.rush) out.push({ kind: 'rush', label: 'Stampede' });
  if (m.keywords.doubleAttack) out.push({ kind: 'onslaught', label: 'Onslaught' });
  if (m.keywords.noAttack) out.push({ kind: 'noAttack', label: "Can't attack" });
  if (m.disabledOnTurn !== undefined && m.disabledOnTurn >= turn) out.push({ kind: 'disabled', label: 'Disabled' });
  if (m.expiresOnTurn !== undefined) out.push({ kind: 'expiring', label: 'Expiring' });
  if (m.silenced) out.push({ kind: 'silenced', label: 'Suppressed' });
  if (sick) out.push({ kind: 'asleep', label: 'Not ready' });
  return out;
};

/**
 * How a stat compares with the card's printed number: `up` when buffed above it, `down` when below it, `same` otherwise.
 * For Health, being damaged is a separate thing (`damaged`): a minion can be buffed and damaged at once.
 */
export const statTone = (current: number, printed: number | undefined): 'up' | 'down' | 'same' =>
  printed === undefined || current === printed ? 'same' : current > printed ? 'up' : 'down';

/** The minion has taken damage that has not been healed. */
export const isDamaged = (m: Pick<MinionInstance, 'health' | 'maxHealth'>): boolean => m.health < m.maxHealth;

/** The most minions a side can have, and the smallest and largest oval height (px) a minion is drawn at. */
export const MAX_BOARD_MINIONS = 7;
export const MINION_OVAL_MAX = 128;
export const MINION_OVAL_MIN = 76;
/** Room a minion needs beside its oval (the Attack and Health badges stick out), and the gap between minions, in px. */
const SLOT_SIDE = 26;
const SLOT_GAP = 4;

/**
 * The oval height (px) for the board minions, so a full side of seven fits one row of `boardWidth` px: full size (128px) when
 * there is room, smaller on a narrow window, never below `MINION_OVAL_MIN`. The oval is 1 : 1.25 (width : height).
 */
export const minionOvalHeight = (boardWidth: number): number => {
  if (boardWidth <= 0) return MINION_OVAL_MAX;
  const ovalWidth = (boardWidth - SLOT_GAP * (MAX_BOARD_MINIONS - 1)) / MAX_BOARD_MINIONS - SLOT_SIDE;
  return Math.floor(Math.min(MINION_OVAL_MAX, Math.max(MINION_OVAL_MIN, ovalWidth * 1.25)));
};
