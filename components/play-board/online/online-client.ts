import type { Action, CardCatalog, GameState } from '../../../engine';
import { getCardDef } from '../../../engine';
import type {
  ClientMessage,
  GameView,
  ServerMessage,
} from '../../../server/protocol';

const SESSION_KEY = 'ccg.session.v1';
const SESSION_ID_LENGTH = 32;
const RECONNECT_BASE_MS = 500;
const RECONNECT_MAX_MS = 8000;

/** A random id that stays in this browser: it is how a dropped game is found. */
export const sessionId = (): string => {
  try {
    const saved = window.localStorage.getItem(SESSION_KEY);
    if (saved && /^[A-Za-z0-9-]{16,64}$/.test(saved)) return saved;
    const bytes = new Uint8Array(SESSION_ID_LENGTH / 2);
    window.crypto.getRandomValues(bytes);
    const id = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join(
      '',
    );
    window.localStorage.setItem(SESSION_KEY, id);

    return id;
  } catch {
    return Math.random().toString(16).slice(2).padEnd(SESSION_ID_LENGTH, '0');
  }
};

/**
 * `NEXT_PUBLIC_WS_URL` while developing (the game server runs on its own
 * port); otherwise the same host as the page.
 */
export const socketUrl = (id: string): string => {
  const base =
    process.env.NEXT_PUBLIC_WS_URL ??
    `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws`;

  return `${base}?s=${id}`;
};

/**
 * Puts back what the server had to take out of the state: a face-down foe
 * Mystery gets any card of its category, so the board can show "Mystery
 * (category)" as it does against the AI.
 */
export const rehydrate = (view: GameView, catalog: CardCatalog): GameState => {
  const { state, seat, foeMysteryCategory } = view;
  const foe = seat === '0' ? '1' : '0';
  const mystery = state.players[foe].mystery;
  if (!mystery || !foeMysteryCategory) return state;
  const standIn = Array.from(catalog.values()).find(
    (card) => getCardDef(card)?.mystery?.category === foeMysteryCategory,
  );
  if (!standIn) return state;

  return {
    ...state,
    players: {
      ...state.players,
      [foe]: {
        ...state.players[foe],
        mystery: { ...mystery, cardId: standIn.id },
      },
    },
  };
};

/**
 * `replaced`: the server gave this browser's session to another window, so
 * this one stays closed until asked to take it back (`takeOver`).
 */
export type ClientStatus = 'connecting' | 'open' | 'closed' | 'replaced';

/** What the server says when another window took the session. */
export const REPLACED_REASON = 'replaced';

export interface ClientHandlers {
  onMessage: (message: ServerMessage) => void;
  onStatus: (status: ClientStatus) => void;
}

/**
 * One WebSocket to the game server that opens again by itself after a drop
 * (the same session id, so a game in progress is handed back).
 */
export class OnlineClient {
  private socket: WebSocket | null = null;
  private retry = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private isStopped = false;

  constructor(private readonly handlers: ClientHandlers) {}

  start(): void {
    this.isStopped = false;
    this.open();
  }

  /** Take the session back from the other window. */
  takeOver(): void {
    if (this.timer) clearTimeout(this.timer);
    this.retry = 0;
    this.open();
  }

  stop(): void {
    this.isStopped = true;
    if (this.timer) clearTimeout(this.timer);
    this.socket?.close();
    this.socket = null;
  }

  send(message: ClientMessage): void {
    if (this.socket?.readyState === WebSocket.OPEN)
      this.socket.send(JSON.stringify(message));
  }

  sendAction(action: Action): void {
    this.send({ t: 'action', action });
  }

  private open(): void {
    this.handlers.onStatus('connecting');
    const socket = new WebSocket(socketUrl(sessionId()));
    this.socket = socket;
    socket.onopen = () => {
      this.retry = 0;
      this.handlers.onStatus('open');
    };
    socket.onmessage = (event) => {
      try {
        this.handlers.onMessage(JSON.parse(String(event.data)));
      } catch {
        /* a message that is not ours is ignored */
      }
    };
    socket.onclose = (event) => {
      if (this.socket !== socket || this.isStopped) return;
      // Reconnecting would take the session straight back and push the other
      // window off, so two windows would trade it forever (a flicker).
      if (event.reason === REPLACED_REASON) {
        this.handlers.onStatus('replaced');

        return;
      }

      this.handlers.onStatus('closed');
      const wait = Math.min(
        RECONNECT_MAX_MS,
        RECONNECT_BASE_MS * 2 ** this.retry,
      );
      this.retry += 1;
      this.timer = setTimeout(() => this.open(), wait);
    };
  }
}
