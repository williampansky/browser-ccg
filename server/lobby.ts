import type { Action, Card, GameEvent, PlayerId, Rng } from '../engine';
import {
  buildClassDeck,
  checkDeck,
  classCardsFor,
  getHero,
  heroes,
  MAX_DECK_SIZE,
} from '../engine';
import {
  cleanName,
  THEMES,
  themeOf,
} from '../components/player-profile/profile';
import type { BotKind, SeatInfo } from './match';
import { Match } from './match';
import { Matchmaker } from './matchmaker';
import type { MatchmakerConfig } from './matchmaker';
import type { ClientMessage, ServerMessage } from './protocol';

/** The part of a WebSocket the lobby uses, so tests can pass a fake. */
export interface Connection {
  send(message: ServerMessage): void;
}

export interface LobbyConfig {
  matchmaker: MatchmakerConfig;
  /** Pause before each bot move, so a person can follow. */
  botDelayMs: number;
  /** How long a person who dropped has to come back before they concede. */
  graceMs: number;
  /** How long a finished game is kept so both can read the result. */
  keepOverMs: number;
}

export interface LobbyDeps {
  rng: Rng;
  catalog: ReadonlyMap<string, Card>;
  /** Every card a deck may use, class-locked ones excluded. */
  ordinaryPool: Card[];
  /** Every card the engine can play, to build bot decks and check decks. */
  allCards: Card[];
  config: LobbyConfig;
}

interface Entry {
  deck: string[];
  hero: string;
  seat: SeatInfo;
}

interface Session {
  connection?: Connection;
  entry?: Entry;
  game?: Game;
  seat?: PlayerId;
  /** When they dropped, while in a game against a person. */
  droppedAt?: number;
}

interface Game {
  match: Match;
  sessions: Partial<Record<PlayerId, string>>;
  nextBotAt: number;
  overAt?: number;
}

const BOT_NAMES: Record<BotKind, string> = {
  greedy: 'Training Bot',
  random: 'Wandering Bot',
};

/**
 * Everything between the sockets and the games: who is searching, who is in
 * which game, what to do when someone drops. It has no sockets or timers of its
 * own; the server calls `tick(now)` about once a second or faster.
 */
export class Lobby {
  private readonly sessions = new Map<string, Session>();
  private readonly games = new Set<Game>();
  private readonly matchmaker: Matchmaker;

  constructor(private readonly deps: LobbyDeps) {
    this.matchmaker = new Matchmaker(deps.rng, deps.config.matchmaker);
  }

  get queueSize(): number {
    return this.matchmaker.size;
  }

  get gameCount(): number {
    return this.games.size;
  }

  /** A socket arrived for this session id; a game in progress is resumed. */
  connect(id: string, connection: Connection): void {
    const session = this.sessions.get(id) ?? {};
    this.sessions.set(id, session);
    session.connection = connection;
    delete session.droppedAt;
    if (session.game && session.seat) this.sendMatched(session);
    else if (this.matchmaker.has(id)) {
      connection.send({ t: 'queued', since: Date.now() });
    }
  }

  disconnect(id: string, now: number): void {
    const session = this.sessions.get(id);
    if (!session) return;
    delete session.connection;
    this.matchmaker.remove(id);
    const game = session.game;
    if (game && !game.match.isOver) session.droppedAt = now;
    else if (!game) this.sessions.delete(id);
  }

  message(id: string, message: ClientMessage, now: number): void {
    const session = this.sessions.get(id);
    if (!session) return;
    if (message.t === 'queue') this.enqueue(id, session, message, now);
    else if (message.t === 'leave') this.matchmaker.remove(id);
    else if (message.t === 'action') this.act(session, message.action, now);
  }

  /** Pairs the queue, runs clocks and bots, drops people who left. */
  tick(now: number): void {
    this.matchmaker.pair(now).forEach((pairing) => {
      if (pairing.kind === 'humans') {
        this.start(pairing.first.id, pairing.second.id, undefined, now);
      } else this.start(pairing.ticket.id, undefined, pairing.bot, now);
    });
    this.games.forEach((game) => this.tickGame(game, now));
  }

  private enqueue(
    id: string,
    session: Session,
    message: Extract<ClientMessage, { t: 'queue' }>,
    now: number,
  ): void {
    if (session.game && !session.game.match.isOver)
      return this.fail(session, 'ALREADY_IN_GAME');
    const entry = this.checkEntry(message);
    if ('error' in entry) return this.fail(session, entry.error);
    session.entry = entry;
    delete session.game;
    delete session.seat;
    this.matchmaker.add(id, now);
    session.connection?.send({ t: 'queued', since: now });
  }

  /** The deck and hero a player may queue with, or why not. */
  private checkEntry(
    message: Extract<ClientMessage, { t: 'queue' }>,
  ): Entry | { error: string } {
    const { deck, hero, name, color } = message;
    if (!getHero(hero)) return { error: 'UNKNOWN_HERO' };
    if (!Array.isArray(deck) || deck.some((c) => typeof c !== 'string'))
      return { error: 'BAD_DECK' };
    if (deck.length !== MAX_DECK_SIZE) return { error: 'DECK_NOT_FULL' };
    const allowed = new Set(
      [
        ...this.deps.ordinaryPool,
        ...classCardsFor(this.deps.allCards, hero),
      ].map((card) => card.id),
    );
    if (deck.some((cardId) => !allowed.has(cardId)))
      return { error: 'CARD_NOT_ALLOWED' };
    if (!checkDeck(deck, this.deps.catalog, true, hero).ok)
      return { error: 'BAD_DECK' };

    return {
      deck,
      hero,
      seat: { name: cleanName(name), color: themeOf(color).id },
    };
  }

  private act(session: Session, action: Action, now: number): void {
    const { game, seat } = session;
    if (!game || !seat) return this.fail(session, 'NOT_IN_GAME');
    const step = game.match.submit(seat, action, now);
    if ('error' in step) return this.fail(session, step.error);
    this.broadcast(game, step.events, now);
  }

  private start(
    firstId: string,
    secondId: string | undefined,
    bot: BotKind | undefined,
    now: number,
  ): void {
    const first = this.sessions.get(firstId);
    const second = secondId ? this.sessions.get(secondId) : undefined;
    if (!first?.entry || (secondId && !second?.entry)) return;
    const botSide = secondId ? undefined : this.botEntry(bot ?? 'greedy');
    const entries = [first.entry, second?.entry ?? botSide] as [Entry, Entry];
    // Seats are shuffled so the first person is not always seat 0.
    const flip = this.deps.rng.int(2) === 1;
    const [a, b] = flip ? [entries[1], entries[0]] : entries;
    const match = new Match(
      {
        decks: { '0': a.deck, '1': b.deck },
        heroes: { '0': a.hero, '1': b.hero },
        seats: { '0': a.seat, '1': b.seat },
        catalog: this.deps.catalog,
        rng: this.deps.rng,
        bonusCard: 'GAME_001',
      },
      now,
    );
    const game: Game = { match, sessions: {}, nextBotAt: now };
    this.games.add(game);
    const people: [Session | undefined, string | undefined, Entry][] = [
      [first, firstId, entries[0]],
      [second, secondId, entries[1]],
    ];
    people.forEach(([session, id, entry]) => {
      if (!session || !id) return;
      const seat: PlayerId = entry === a ? '0' : '1';
      session.game = game;
      session.seat = seat;
      delete session.droppedAt;
      game.sessions[seat] = id;
      this.sendMatched(session);
    });
  }

  private botEntry(bot: BotKind): Entry {
    const { rng, allCards, ordinaryPool } = this.deps;
    const hero = rng.pick(heroes()).id;
    const deck = buildClassDeck(
      ordinaryPool,
      classCardsFor(allCards, hero),
      rng,
    );

    return {
      deck,
      hero,
      seat: { name: BOT_NAMES[bot], color: rng.pick(THEMES).id, bot },
    };
  }

  private sendMatched(session: Session): void {
    const { game, seat, connection } = session;
    if (!game || !seat || !connection) return;
    connection.send({
      t: 'matched',
      opponent: game.match.opponentOf(seat),
      view: game.match.viewFor(seat),
    });
  }

  private broadcast(game: Game, events: GameEvent[], now: number): void {
    (['0', '1'] as PlayerId[]).forEach((seat) => {
      const id = game.sessions[seat];
      const connection = id && this.sessions.get(id)?.connection;
      if (!connection) return;
      connection.send({
        t: 'update',
        events,
        view: game.match.viewFor(seat),
      });
    });
    if (game.match.isOver && game.overAt === undefined) game.overAt = now;
  }

  private tickGame(game: Game, now: number): void {
    const { match } = game;
    if (match.isOver) return this.sweep(game, now);
    const timedOut = match.tick(now);
    if (timedOut && 'events' in timedOut)
      return this.broadcast(game, timedOut.events, now);
    this.concedeForDropped(game, now);
    if (match.isOver || now < game.nextBotAt) return;
    const step = match.botStep(now);
    if (step && 'events' in step) {
      game.nextBotAt = now + this.deps.config.botDelayMs;
      this.broadcast(game, step.events, now);
    }
  }

  private concedeForDropped(game: Game, now: number): void {
    (['0', '1'] as PlayerId[]).forEach((seat) => {
      const id = game.sessions[seat];
      const droppedAt = id ? this.sessions.get(id)?.droppedAt : undefined;
      if (droppedAt === undefined || game.match.isOver) return;
      if (now - droppedAt < this.deps.config.graceMs) return;
      const step = game.match.submit(seat, { type: 'Concede' }, now);
      if ('events' in step) this.broadcast(game, step.events, now);
    });
  }

  /** Forgets a finished game once it has been shown for long enough. */
  private sweep(game: Game, now: number): void {
    if (game.overAt === undefined) game.overAt = now;
    if (now - game.overAt < this.deps.config.keepOverMs) return;
    this.games.delete(game);
    (['0', '1'] as PlayerId[]).forEach((seat) => {
      const id = game.sessions[seat];
      const session = id && this.sessions.get(id);
      if (!session || session.game !== game) return;
      delete session.game;
      delete session.seat;
      if (!session.connection && id) this.sessions.delete(id);
    });
  }

  private fail(session: Session, code: string): void {
    session.connection?.send({ t: 'error', code });
  }
}
