import type {
  Action,
  ActionError,
  CardCatalog,
  GameEvent,
  GameState,
  PlayerId,
  Rng,
} from '../engine';
import {
  applyAction,
  chooseGreedyAction,
  chooseRandomAction,
  createGame,
  turnSeconds,
} from '../engine';
import type { GameView, OpponentInfo } from './protocol';
import { foeMysteryCategory, redactFor } from './redact';

const MS_PER_SECOND = 1000;

export type BotKind = 'greedy' | 'random';

/** Who sits in a seat. A bot seat has `bot` set and takes no network input. */
export interface SeatInfo {
  name: string;
  color: string;
  bot?: BotKind;
}

export interface MatchSetup {
  decks: Record<PlayerId, string[]>;
  heroes: Record<PlayerId, string>;
  seats: Record<PlayerId, SeatInfo>;
  catalog: CardCatalog;
  rng: Rng;
  /** The Orb, added to the second player's opening hand. */
  bonusCard: string;
}

export type Step = { events: GameEvent[] } | ActionError;

/**
 * One game on the server: the only copy of the state. It checks whose move
 * it is, runs the engine, keeps the turn clock and plays bot seats. It has no
 * sockets or timers of its own; whoever drives it passes the time in.
 */
export class Match {
  state: GameState;
  /** Epoch ms when the current turn ends by itself. */
  deadline = 0;
  private readonly seats: Record<PlayerId, SeatInfo>;
  private readonly catalog: CardCatalog;
  private readonly rng: Rng;

  constructor(setup: MatchSetup, now: number) {
    const { catalog, rng, seats } = setup;
    this.catalog = catalog;
    this.rng = rng;
    this.seats = seats;
    const firstPlayer: PlayerId = rng.int(2) === 0 ? '0' : '1';
    this.state = createGame(
      {
        decks: setup.decks,
        firstPlayer,
        secondPlayerBonusCard: setup.bonusCard,
        heroes: setup.heroes,
      },
      rng,
    );
    this.resetClock(now);
  }

  get isOver(): boolean {
    return this.state.status === 'over';
  }

  /** The info the other seat is shown about `seat`. */
  opponentOf(seat: PlayerId): OpponentInfo {
    const { name, color, bot } = this.seats[seat === '0' ? '1' : '0'];

    return { name, color, isBot: !!bot };
  }

  viewFor(seat: PlayerId): GameView {
    return {
      state: redactFor(this.state, seat),
      seat,
      foeMysteryCategory: foeMysteryCategory(this.state, seat, this.catalog),
      deadline: this.deadline,
    };
  }

  /**
   * A player's action. Only the active player may act, except that anyone may
   * concede, and only for themselves.
   */
  submit(seat: PlayerId, action: Action, now: number): Step {
    const isConcede = action.type === 'Concede';
    if (!isConcede && this.state.activePlayer !== seat)
      return { error: 'NOT_YOUR_TURN' };

    return this.run(
      isConcede ? { type: 'Concede', player: seat } : action,
      now,
    );
  }

  /** Ends the turn when the clock has run out. Null when it has not. */
  tick(now: number): Step | null {
    if (this.isOver || now < this.deadline) return null;

    return this.run({ type: 'EndTurn' }, now);
  }

  /**
   * One move by the bot when the active seat is a bot, else null. The driver
   * calls it with a pause between moves so a human can follow.
   */
  botStep(now: number): Step | null {
    const { activePlayer } = this.state;
    const { bot } = this.seats[activePlayer];
    if (!bot || this.isOver) return null;
    const choose = bot === 'greedy' ? chooseGreedyAction : chooseRandomAction;
    const action = choose(this.state, this.catalog, this.rng);
    const step = this.run(action, now);
    // A bot that picks something illegal must not stall the game.
    if ('error' in step) return this.run({ type: 'EndTurn' }, now);

    return step;
  }

  private run(action: Action, now: number): Step {
    const before = this.state;
    const result = applyAction(before, action, {
      rng: this.rng,
      catalog: this.catalog,
    });
    if ('error' in result) return result;
    this.state = result.state;
    const isNewTurn =
      result.state.turn !== before.turn ||
      result.state.activePlayer !== before.activePlayer;
    if (isNewTurn) this.resetClock(now);

    return { events: result.events };
  }

  private resetClock(now: number): void {
    const seconds = turnSeconds(this.state, this.catalog);
    this.deadline = now + seconds * MS_PER_SECOND;
  }
}
