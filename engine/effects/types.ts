import type { Draft } from 'immer';
import type { CardCatalog } from '../cards/types';
import type { Rng } from '../rng';
import type { GameEvent, GameState, PlayerId, TargetRef } from '../state/types';

/** Everything an effect can use while it runs. `g` is an immer draft: mutate it directly. */
export interface EffectContext {
  g: Draft<GameState>;
  caster: PlayerId;
  /** The target the player chose when casting, if the card is targeted */
  target?: TargetRef;
  rng: Rng;
  catalog: CardCatalog;
  events: GameEvent[];
  /** The card whose definition is running (used to find its entourage tokens) */
  sourceCardId?: string;
  /** The minion this effect belongs to: a warcry's minion, or the owner of a trigger or death effect */
  self?: number;
  /** Spell damage the caster has right now; set only while a SPELL is being played (RULES Q16) */
  spellDamage?: number;
  /** The event that fired this trigger, if it is one */
  event?: GameEvent;
}

/** One step of a card's behaviour. Built from the primitives in `primitives.ts`. */
export type Effect = (ctx: EffectContext) => void;

/** Picks who an effect applies to. */
export type Selector = (ctx: EffectContext) => TargetRef[];

/** Decides which characters a targeted card may be aimed at (used by `legalTargets`). */
export type TargetFilter = (c: {
  state: GameState;
  caster: PlayerId;
  candidate: TargetRef;
  /** Lets a filter look at a minion's card (race, ...) */
  catalog?: CardCatalog;
}) => boolean;
