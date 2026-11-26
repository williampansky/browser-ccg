import type { Rng } from '../engine';
import type { BotKind } from './match';

/** A player waiting for a game. `id` is whatever the server keys them by. */
export interface Ticket {
  id: string;
  /** Epoch ms when they started searching. */
  since: number;
}

export type Pairing =
  | { kind: 'humans'; first: Ticket; second: Ticket }
  | { kind: 'bot'; ticket: Ticket; bot: BotKind };

export interface MatchmakerConfig {
  /** How long to look for a person before playing a bot. */
  waitMs: number;
  /** Chance (0 to 1) that the fallback bot is the greedy one. */
  greedyShare: number;
}

export const DEFAULT_MATCHMAKER: MatchmakerConfig = {
  waitMs: 30000,
  greedyShare: 0.9,
};

const PERCENT = 100;

/**
 * The waiting pool. Oldest first, so whoever has waited longest is paired
 * first. It holds no timers: `pair(now)` is called regularly and returns the
 * games to start.
 */
export class Matchmaker {
  private queue: Ticket[] = [];

  constructor(
    private readonly rng: Rng,
    private readonly config: MatchmakerConfig = DEFAULT_MATCHMAKER,
  ) {}

  get size(): number {
    return this.queue.length;
  }

  has(id: string): boolean {
    return this.queue.some((ticket) => ticket.id === id);
  }

  /** Joins the pool (a second call for the same id keeps the first). */
  add(id: string, now: number): void {
    if (!this.has(id)) this.queue.push({ id, since: now });
  }

  remove(id: string): void {
    this.queue = this.queue.filter((ticket) => ticket.id !== id);
  }

  /** Everyone who can be matched now, removed from the pool. */
  pair(now: number): Pairing[] {
    const out: Pairing[] = [];
    while (this.queue.length >= 2) {
      const [first, second] = this.queue.splice(0, 2);
      out.push({ kind: 'humans', first, second });
    }
    const [waiting] = this.queue;
    if (waiting && now - waiting.since >= this.config.waitMs) {
      this.queue = [];
      out.push({ kind: 'bot', ticket: waiting, bot: this.pickBot() });
    }

    return out;
  }

  private pickBot(): BotKind {
    const greedyPercent = this.config.greedyShare * PERCENT;

    return this.rng.int(PERCENT) < greedyPercent ? 'greedy' : 'random';
  }
}
