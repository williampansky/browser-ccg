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
  /** Extra healing from the caster's board for the spell being played (The Sorceress); set with `spellDamage` */
  spellHealing?: number;
  /** The event that fired this trigger, if it is one */
  event?: GameEvent;
  /** Set while a Mystery reacts to an attack that is about to happen; effects may change `target` to redirect it */
  attack?: { attackerPlayer: PlayerId; attackerId?: number; target: TargetRef };
  /** Set while a Mystery reacts to a spell about to resolve; effects may change `target` to redirect it */
  cast?: { caster: PlayerId; cardId: string; target?: TargetRef };
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
