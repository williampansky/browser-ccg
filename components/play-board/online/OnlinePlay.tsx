import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import {
  createSeededRng,
  loadHsCards,
  playablePool,
  primePool,
  withHeroTokens,
} from '../../../engine';
import type { Action, PlayerId } from '../../../engine';
import type { GameView } from '../../../server/protocol';
import { classCardsFor } from '../../../engine';
import type { ServerMessage } from '../../../server/protocol';
import { loadDecks } from '../../deck-builder/deck-storage';
import { loadProfile } from '../../player-profile/profile';
import { SupportLink } from '../../site-components/SupportLink';
import { AnimatedIcon, Button, Checkbox, Panel, Select } from '../../ui';
import {
  deckIsLegal,
  deckOptions,
  loadChoices,
  resolveDeck,
  savedDeckHero,
  saveChoices,
} from '../deck-choice';
import {
  heroOptions,
  loadHeroChoices,
  resolveHero,
  saveHeroChoices,
} from '../hero-choice';
import { PlayBoard } from '../PlayBoard';
import { OnlineClient, rehydrate } from './online-client';
import { loadVsBot, saveVsBot } from './online-prefs';
import { forSeat } from './seat-flip';
import type { ClientStatus } from './online-client';
import type { OnlineGame, OnlineUpdate } from './types';
import styles from './online.module.scss';

const { cards, byId: baseById } = loadHsCards();
const byId = withHeroTokens(baseById);
const pool = playablePool(cards);
const prime = primePool(cards);
const FULL_DECK = 30;
const SECOND_MS = 1000;
const SPINNER_PX = 44;
/** The player's slot in the saved deck and hero choices (seat 0's). */
const SLOT: PlayerId = '0';

type Phase =
  | { kind: 'menu' }
  | { kind: 'queued'; since: number; botAfterMs: number }
  | {
      kind: 'playing';
      game: Omit<OnlineGame, 'send' | 'leave' | 'isConnected'>;
      key: number;
    };

/**
 * The server's view as the board wants it: filled in, and flipped so the
 * player is always seat 0 (see `seat-flip.ts`).
 */
const boardView = (view: GameView): GameView => ({
  ...view,
  seat: '0',
  state: forSeat(rehydrate(view, byId), view.seat),
});

const ERROR_TEXT: Record<string, string> = {
  DECK_NOT_FULL: 'An online deck needs exactly 30 cards.',
  CARD_NOT_ALLOWED: 'That deck has a card online games do not allow yet.',
  BAD_DECK: 'That deck is not legal.',
  UNKNOWN_HERO: 'Unknown hero.',
  ALREADY_IN_GAME: 'You are already in a game.',
};

/**
 * The online page: pick a hero and deck, wait in the queue, then play. The
 * waiting room and the socket live here; the board itself is `PlayBoard` in
 * its online mode.
 */
export const OnlinePlay = () => {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>({ kind: 'menu' });
  const [status, setStatus] = useState<ClientStatus>('connecting');
  const [error, setError] = useState('');
  const [updates, setUpdates] = useState<OnlineUpdate[]>([]);
  const [deckChoice, setDeckChoice] = useState('random-all');
  const [heroChoice, setHeroChoice] = useState('random');
  const [vsBot, setVsBot] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const client = useRef<OnlineClient | null>(null);
  const lastDeck = useRef<string[]>([]);
  const matchCount = useRef(0);
  /** The real seat in the current game; the board only knows seat 0. */
  const seat = useRef<PlayerId>('0');
  const saved = useMemo(
    () => (typeof window === 'undefined' ? [] : loadDecks(byId)),
    [],
  );
  const usable = saved.filter(
    (deck) =>
      deck.cards.length === FULL_DECK &&
      deckIsLegal(deck.cards, byId, deck.hero),
  );

  useEffect(() => {
    setDeckChoice(loadChoices()[SLOT]);
    setHeroChoice(loadHeroChoices()[SLOT]);
    setVsBot(loadVsBot());
  }, []);

  const onMessage = useCallback((message: ServerMessage) => {
    if (message.t === 'queued')
      setPhase({
        kind: 'queued',
        since: Date.now(),
        botAfterMs: message.botAfterMs,
      });
    else if (message.t === 'error') setError(message.code);
    else if (message.t === 'matched') {
      matchCount.current += 1;
      seat.current = message.view.seat;
      setUpdates([]);
      setError('');
      setPhase({
        kind: 'playing',
        key: matchCount.current,
        game: {
          seat: '0',
          opponent: message.opponent,
          myDeck: lastDeck.current,
          myName: loadProfile().name,
          initial: boardView(message.view),
          updates: [],
          error: '',
        },
      });
    } else if (message.t === 'update') {
      const { action, events, view, note } = message;
      setUpdates((old) => [
        ...old,
        {
          action: forSeat(action, seat.current),
          events: forSeat(events, seat.current),
          view: boardView(view),
          note,
        },
      ]);
    }
  }, []);

  useEffect(() => {
    const online = new OnlineClient({ onMessage, onStatus: setStatus });
    client.current = online;
    online.start();

    return () => online.stop();
  }, [onMessage]);

  const isQueued = phase.kind === 'queued';
  useEffect(() => {
    if (!isQueued) return;
    const id = setInterval(() => setNow(Date.now()), SECOND_MS);

    return () => clearInterval(id);
  }, [isQueued]);

  const find = () => {
    const rng = createSeededRng(Date.now() % 2147483647);
    const hero = resolveHero(
      savedDeckHero(deckChoice, usable) ?? heroChoice,
      rng,
    );
    if (!hero) return;
    const picked = resolveDeck(
      deckChoice,
      pool,
      usable,
      rng,
      prime,
      classCardsFor(cards, hero),
    );
    lastDeck.current = picked.cards;
    saveChoices({ ...loadChoices(), [SLOT]: deckChoice });
    saveHeroChoices({ ...loadHeroChoices(), [SLOT]: heroChoice });
    saveVsBot(vsBot);
    const profile = loadProfile();
    setError('');
    client.current?.send({
      t: 'queue',
      deck: picked.cards,
      hero,
      name: profile.name,
      color: profile.theme,
      vsBot,
    });
  };

  const send = useCallback(
    (action: Action) =>
      client.current?.sendAction(forSeat(action, seat.current)),
    [],
  );
  const cancel = () => {
    client.current?.send({ t: 'leave' });
    setPhase({ kind: 'menu' });
  };
  const leave = useCallback(() => {
    setPhase({ kind: 'menu' });
    setUpdates([]);
  }, []);
  const home = useCallback(() => {
    client.current?.send({ t: 'leave' });
    setPhase({ kind: 'menu' });
    setUpdates([]);
    router.push({ pathname: '/' });
  }, []);

  if (phase.kind === 'playing') {
    const game: OnlineGame = {
      ...phase.game,
      updates,
      error,
      isConnected: status === 'open',
      send,
      leave,
    };

    return <PlayBoard key={phase.key} online={game} />;
  }

  const options = deckOptions(usable);
  const heroes = heroOptions();
  const waited = isQueued ? Math.floor((now - phase.since) / SECOND_MS) : 0;

  const botAfterSeconds = isQueued
    ? Math.round(phase.botAfterMs / SECOND_MS)
    : 0;
  const progress = isQueued
    ? Math.min(100, ((now - phase.since) / phase.botAfterMs) * 100)
    : 0;

  return (
    <main className={styles.page}>
      <Panel className={styles.panel}>
        <h1>Play</h1>
        <p className={styles.note}>
          {status === 'open'
            ? '✅ Connected to the game server.'
            : status === 'connecting'
              ? '⏳ Connecting to the game server...'
              : '❌ Connection lost. Trying again...'}
        </p>
        <div className={styles.choices}>
          <div className={styles.heroSelect}>
            <label className={styles.row}>
              <span>Hero</span>
              <Select
                aria-label="Hero"
                disabled={isQueued}
                name="hero"
                onChange={(e) => setHeroChoice(e.target.value)}
                value={heroChoice}
              >
                {heroes.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </label>
          </div>
          <div className={styles.deckSelect}>
            <label className={styles.row}>
              <span>Deck</span>
              <Select
                aria-label="Deck"
                disabled={isQueued}
                name="deck"
                onChange={(e) => setDeckChoice(e.target.value)}
                value={
                  options.some((o) => o.value === deckChoice)
                    ? deckChoice
                    : options[0].value
                }
              >
                {options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </label>
          </div>
        </div>
        {saved.length > usable.length && (
          <p className={styles.note}>
            Saved decks need exactly 30 legal cards to play online.{' '}
            <a href="/deckbuilder">Deck builder</a>
          </p>
        )}
        <Checkbox
          checked={vsBot}
          className={styles.skipCheckbox}
          disabled={isQueued}
          title="Start a game against a bot right away instead of waiting for another player"
          onChange={setVsBot}
        >
          Skip the queue: play against a bot
        </Checkbox>
        {error && (
          <p role="alert" className={styles.error}>
            {ERROR_TEXT[error] ?? `Could not queue (${error}).`}
          </p>
        )}
        {isQueued ? (
          <div className={styles.queue} role="status">
            <AnimatedIcon name="dots-circle" loop on size={SPINNER_PX} />
            <strong>Searching for an opponent...</strong>
            <span className={styles.timer}>{waited}s</span>
            <div
              className={styles.bar}
              aria-hidden="true"
              style={{ ['--progress' as string]: `${progress}%` }}
            />
            <small>
              If nobody joins in {botAfterSeconds} seconds you will play a bot.
            </small>
            <Button onClick={cancel}>Cancel</Button>
          </div>
        ) : (
          <div className={styles.buttons}>
            <div className={styles.playButton}>
              <Button
                variant="primary"
                disabled={status !== 'open'}
                onClick={find}
              >
                {vsBot ? 'Play a bot' : 'Find match'}
              </Button>
            </div>
            <div className={styles.homeButton}>
              <Button onClick={home}>Home</Button>
            </div>
          </div>
        )}
        <p className={styles.note}>
          <a href="/play/local">Offline: vs AI or hot-seat</a>
          {' · '}
          <SupportLink />
        </p>
      </Panel>
    </main>
  );
};
