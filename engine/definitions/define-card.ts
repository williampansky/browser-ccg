import type { Card, CardCatalog, CardNumbers } from '../cards/types';
import type { Effect, TargetFilter } from '../effects/types';
import type { GameEvent, GameEventType, GameState, MinionInstance, PlayerId, TargetRef } from '../state/types';

/** What a trigger's `when` condition can look at. */
export interface TriggerInfo {
  state: GameState;
  catalog: CardCatalog;
  /** Who controls the minion the trigger belongs to */
  owner: PlayerId;
  /** That minion's instance id */
  selfId: number;
}

/** "When this event happens (and `when` holds) while this minion is on the board, run `do`." */
export interface Trigger {
  event: GameEventType;
  when?: (e: GameEvent, c: TriggerInfo) => boolean;
  do: Effect[];
}

/** Builds a trigger with the event type narrowed in `when`. */
export const on = <K extends GameEventType>(
  event: K,
  opts: { when?: (e: Extract<GameEvent, { type: K }>, c: TriggerInfo) => boolean; do: Effect[] }
): Trigger => ({
  event,
  when: opts.when as Trigger['when'],
  do: opts.do,
});

/** One option of a "choose one" card. */
export interface Choice {
  label: string;
  target?: TargetFilter;
  onPlay: Effect[];
}

/**
 * What a card does. Cards with no `target` are global. For a minion, `onPlay` is its warcry.
 * `onDeath` runs after the minion has been removed (owner is the caster). `triggers` are live
 * only while the minion is on the board (this covers end-of-turn and "whenever ..." cards).
 */
/** What an aura minion does to the minions it reaches while it is on the board. */
export interface Aura {
  /** Does this aura reach `target`? (`distance` is the board-slot gap on the same side, else Infinity.) */
  affects: (c: {
    source: MinionInstance;
    target: MinionInstance;
    sameSide: boolean;
    distance: number;
    targetRace?: string;
  }) => boolean;
  attack?: number;
  rush?: boolean;
}

/** "Your <cards> cost N less/more" while this minion is on the board (the owner's cards only). */
export interface CostMod {
  affects: (card: Card) => boolean;
  /** Negative makes cards cheaper, positive dearer */
  delta: number;
  /** A reduction never takes a card below this (or below its own printed cost, if that is already lower). Default 0 */
  floor?: number;
}

/** What a minion gives ITSELF while a condition holds ("+3 Attack if damaged", "Stampede if you have a weapon"). */
export interface SelfAura {
  attack?: number;
  rush?: boolean;
  doubleAttack?: boolean;
}

/** What a face-down Mystery spell does. It only reacts on the opponent's turn, and then it is gone (RULES Appendix C). */
export interface MysteryCheck {
  state: GameState;
  catalog: CardCatalog;
  /** The Mystery's owner */
  owner: PlayerId;
  /** The event, for event-based Mysteries */
  event?: GameEvent;
  /** The attack about to happen, for `hook: 'attack'` */
  attack?: { attackerPlayer: PlayerId; attackerId?: number; target: TargetRef };
  /** The spell about to resolve, for `hook: 'spell'` */
  cast?: { caster: PlayerId; cardId: string; target?: TargetRef };
}

export type MysteryCategory = 'attack' | 'spell' | 'minion' | 'damage' | 'death';

export interface MysteryDef {
  /** What the opponent is told about a face-down Mystery */
  category: MysteryCategory;
  /** Reacts BEFORE an enemy attack / enemy spell resolves (it may redirect it) ... */
  hook?: 'attack' | 'spell';
  /** ... or AFTER this event happens */
  event?: GameEventType;
  when: (c: MysteryCheck) => boolean;
  do: Effect[];
}

export interface CardDef {
  /** Present on a Mystery spell: it is placed face down instead of resolving */
  mystery?: MysteryDef;
  /** Keywords the card's data lists but the minion only has under a condition (see `selfAura`): not given when it is created */
  conditionalKeywords?: (keyof import('../state/types').MinionKeywords)[];
  /**
   * Conditions on the minion itself, rechecked after every step. `base` is its Attack without any aura or condition
   * (so "Attack always equals Health" can be `health - base`).
   */
  selfAura?: (c: { minion: MinionInstance; state: GameState; owner: PlayerId; base: number }) => SelfAura;
  /** Cost changes this minion gives its owner's cards in hand while it is on the board */
  costMods?: CostMod[];
  /** A change to this card's own cost while it is in hand ("costs 1 less for each ..."). Negative is cheaper */
  ownCost?: (c: { state: GameState; owner: PlayerId }) => number;
  /** "+N Spell Damage" while on the board: raises the damage of your spells (RULES Q16) */
  spellDamage?: number;
  /** Ongoing effects on other minions while this one is on the board (recomputed after every step) */
  auras?: Aura[];
  /** For weapons: runs before each hero attack with the weapon */
  beforeAttack?: Effect[];
  /**
   * "Choose one" cards: the player picks an option when playing (`PlayCard.choice`), and that option's
   * own `target` and `onPlay` apply instead of the card's. Options have a short `label` for the UI.
   */
  choices?: Choice[];
  /** Which characters the player may aim it at. Omit for a global card. */
  target?: TargetFilter;
  onPlay?: Effect[];
  onDeath?: Effect[];
  triggers?: Trigger[];
}

/** Looks up a card's behaviour. The engine defaults to the real registry; tests can inject their own. */
export type DefLookup = (card: Card) => CardDef | undefined;

/** The card's number fields, with a clear error if a card is missing one it needs. */
export interface Numbers {
  primary: number;
  secondary: number;
  random: number;
  overcharge: number;
}

export interface Definition {
  id: string;
  create: (n: Numbers) => CardDef;
}

export const defineCard = (id: string, create: (n: Numbers) => CardDef): Definition => ({ id, create });

/**
 * The only place that reads raw number fields (RULES Q23 is provisional, so what each field means
 * lives here). Asking for a number the card doesn't have throws instead of silently using NaN.
 */
export const numbersOf = (id: string, raw: CardNumbers): Numbers => {
  const need = (name: keyof CardNumbers) => {
    const v = raw[name];
    if (v === undefined) throw new Error(`${id} has no ${name} number but its definition needs it`);
    return v;
  };
  return {
    get primary() {
      return need('primary');
    },
    get secondary() {
      return need('secondary');
    },
    get random() {
      return need('random');
    },
    get overcharge() {
      return need('overcharge');
    },
  };
};
