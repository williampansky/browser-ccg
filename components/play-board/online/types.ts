import type { Action, GameEvent, PlayerId } from '../../../engine';
import type { GameView, OpponentInfo } from '../../../server/protocol';

/** One move from the server, to be played out on the board. */
export interface OnlineUpdate {
  action: Action;
  events: GameEvent[];
  view: GameView;
  /** Set when the opponent left and the server conceded for them. */
  note?: 'opponent-left';
}

/**
 * Everything `PlayBoard` needs to show a game that lives on the server. The
 * board does not run the rules here: it sends actions and plays back what
 * comes back.
 */
export interface OnlineGame {
  seat: PlayerId;
  opponent: OpponentInfo;
  /** The player's own deck list, for the deck tracker. */
  myDeck: string[];
  /** The player's own name and colour theme. */
  myName: string;
  /** The state when the game was handed over (a start, or a rejoin). */
  initial: GameView;
  /** Moves since then, oldest first; the board plays them in order. */
  updates: OnlineUpdate[];
  /** The last thing the server refused, as a code (`NOT_YOUR_TURN`, ...). */
  error: string;
  /** False while the socket is down and the board is waiting to reconnect. */
  isConnected: boolean;
  send: (action: Action) => void;
  /** Back to the lobby after the game. */
  leave: () => void;
}
