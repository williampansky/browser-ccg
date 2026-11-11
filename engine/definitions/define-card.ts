import type { Card, CardCatalog, CardNumbers } from '../cards/types';
import type { Effect, TargetFilter } from '../effects/types';
import type { GameEvent, GameEventType, GameState, PlayerId } from '../state/types';

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

/**
 * What a card does. Cards with no `target` are global. For a minion, `onPlay` is its warcry.
 * `onDeath` runs after the minion has been removed (owner is the caster). `triggers` are live
 * only while the minion is on the board (this covers end-of-turn and "whenever ..." cards).
 */
export interface CardDef {
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
