import type { CardNumbers } from '../cards/types';
import type { Effect, TargetFilter } from '../effects/types';

/** What a card does when played. Cards with no `target` are global. */
export interface CardDef {
  /** Which characters the player may aim it at. Omit for a global card. */
  target?: TargetFilter;
  onPlay: Effect[];
}

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
