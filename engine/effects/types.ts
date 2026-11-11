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
}

/** One step of a card's behaviour. Built from the primitives in `primitives.ts`. */
export type Effect = (ctx: EffectContext) => void;

/** Picks who an effect applies to. */
export type Selector = (ctx: EffectContext) => TargetRef[];

/** Decides which characters a targeted card may be aimed at (used by `legalTargets`). */
export type TargetFilter = (c: { state: GameState; caster: PlayerId; candidate: TargetRef }) => boolean;
