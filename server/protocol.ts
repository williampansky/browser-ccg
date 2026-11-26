import type { Action, GameEvent, GameState, PlayerId } from '../engine';

/** What an opponent looks like to a player: no deck, just a face and a name. */
export interface OpponentInfo {
  name: string;
  color: string;
  isBot: boolean;
}

/**
 * A game as one player may see it. The state is redacted (see `redact.ts`);
 * `foeMysteryCategory` is the category label of the opponent's face-down
 * Mystery, which the state no longer carries.
 */
export interface GameView {
  state: GameState;
  seat: PlayerId;
  foeMysteryCategory?: string;
  /**
   * Milliseconds left in the active player's turn when this was sent (not a
   * clock time, so a wrong clock on the player's computer does not matter).
   */
  msLeft: number;
}

export type ClientMessage =
  | {
      t: 'queue';
      deck: string[];
      hero: string;
      name: string;
      color: string;
    }
  | { t: 'leave' }
  | { t: 'action'; action: Action };

export type ServerMessage =
  | { t: 'queued'; since: number }
  | { t: 'matched'; opponent: OpponentInfo; view: GameView }
  | { t: 'update'; action: Action; events: GameEvent[]; view: GameView }
  | { t: 'error'; code: string };
