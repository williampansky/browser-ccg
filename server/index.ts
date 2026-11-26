import { randomInt } from 'crypto';
import { createServer } from 'http';
import type { IncomingMessage } from 'http';
import type { Duplex } from 'stream';
import { WebSocketServer } from 'ws';
import type { WebSocket } from 'ws';
import {
  createSeededRng,
  loadHsCards,
  playablePool,
  primePool,
  withHeroTokens,
} from '../engine';
import type { Rng } from '../engine';
import { Lobby } from './lobby';
import type { ClientMessage } from './protocol';

const PORT = Number(process.env.PORT ?? 3001);
const IS_DEV = process.env.NODE_ENV !== 'production';
const SERVE_NEXT = process.env.SERVE_NEXT !== 'false';
const TICK_MS = 250;
const STATS_MS = 5 * 60 * 1000;
const MAX_MESSAGE_BYTES = 16 * 1024;
/** More than this many messages inside one window drops the connection. */
const RATE_LIMIT = 40;
const RATE_WINDOW_MS = 5000;
const SESSION_ID = /^[A-Za-z0-9-]{16,64}$/;
const SEED_RANGE = 2147483647;

const envNumber = (name: string, fallback: number): number => {
  const value = Number(process.env[name]);

  return Number.isFinite(value) && value > 0 ? value : fallback;
};

/**
 * A browser that vanishes (a closed laptop, a lost network) never says goodbye,
 * so every socket is pinged and one that stays silent is cut: that starts the
 * reconnect countdown instead of leaving the game waiting forever.
 */
const HEARTBEAT_MS = envNumber('HEARTBEAT_SECONDS', 20) * 1000;

const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

/** Browsers always send Origin on a WebSocket; a missing one is a script. */
const isOriginAllowed = (origin: string | undefined): boolean => {
  if (!origin) return IS_DEV;
  if (allowedOrigins.includes(origin)) return true;

  return IS_DEV && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
};

const { cards, byId } = loadHsCards();
const rng: Rng = createSeededRng(randomInt(SEED_RANGE));
/** One JSON line per event, for Render's log viewer. Never names or ids. */
const log = (event: string, data: Record<string, unknown>): void => {
  console.log(
    JSON.stringify({ time: new Date().toISOString(), event, ...data }),
  );
};

const lobby = new Lobby({
  log,
  rng,
  catalog: withHeroTokens(byId),
  ordinaryPool: [...playablePool(cards), ...primePool(cards)],
  allCards: cards,
  config: {
    matchmaker: {
      waitMs: envNumber('QUEUE_WAIT_SECONDS', 30) * 1000,
      greedyShare: 0.9,
    },
    botDelayMs: 900,
    graceMs: envNumber('RECONNECT_GRACE_SECONDS', 60) * 1000,
    keepOverMs: 10 * 60 * 1000,
  },
});

const sockets = new Map<string, WebSocket>();
/** False once a ping has gone out and no pong has come back. */
const alive = new WeakMap<WebSocket, boolean>();

const wss = new WebSocketServer({
  noServer: true,
  maxPayload: MAX_MESSAGE_BYTES,
});

const parse = (raw: string): ClientMessage | null => {
  try {
    const message = JSON.parse(raw);
    const isObject = typeof message === 'object' && message !== null;

    return isObject && typeof message.t === 'string' ? message : null;
  } catch {
    return null;
  }
};

wss.on('connection', (socket: WebSocket, request: IncomingMessage) => {
  const url = new URL(request.url ?? '', 'http://x');
  const id = url.searchParams.get('s') ?? '';
  if (!SESSION_ID.test(id)) return socket.close(1008, 'bad session');
  // A second tab or a reconnect takes over the session.
  sockets.get(id)?.close(1000, 'replaced');
  sockets.set(id, socket);
  alive.set(socket, true);
  socket.on('pong', () => alive.set(socket, true));
  lobby.connect(id, { send: (m) => socket.send(JSON.stringify(m)) });
  let windowStart = Date.now();
  let count = 0;

  socket.on('message', (data) => {
    const now = Date.now();
    if (now - windowStart > RATE_WINDOW_MS) {
      windowStart = now;
      count = 0;
    }
    if (++count > RATE_LIMIT) return socket.close(1008, 'slow down');
    const message = parse(data.toString());
    if (message) lobby.message(id, message, now);
  });
  socket.on('close', () => {
    if (sockets.get(id) !== socket) return;
    sockets.delete(id);
    lobby.disconnect(id, Date.now());
  });
  socket.on('error', () => socket.close());
});

const onUpgrade = (request: IncomingMessage, socket: Duplex, head: Buffer) => {
  const { pathname } = new URL(request.url ?? '', 'http://x');
  if (pathname !== '/ws') return;
  if (!isOriginAllowed(request.headers.origin)) {
    socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
    return socket.destroy();
  }
  wss.handleUpgrade(request, socket, head, (ws) =>
    wss.emit('connection', ws, request),
  );
};

const start = async (): Promise<void> => {
  let handler: Parameters<typeof createServer>[1] = (_req, res) => {
    res.writeHead(404).end();
  };
  if (SERVE_NEXT) {
    const next = (await import('next')).default({ dev: IS_DEV });
    await next.prepare();
    handler = next.getRequestHandler();
  }
  const server = createServer((req, res) => {
    if (req.url === '/healthz') {
      res.writeHead(200, { 'content-type': 'application/json' });
      const { queueSize, gameCount, finishedCount } = lobby;
      const body = { ok: true, queueSize, gameCount, finishedCount };

      return void res.end(JSON.stringify(body));
    }
    handler?.(req, res);
  });
  server.on('upgrade', onUpgrade);
  setInterval(() => lobby.tick(Date.now()), TICK_MS);
  setInterval(() => {
    wss.clients.forEach((socket) => {
      if (alive.get(socket) === false) return socket.terminate();
      alive.set(socket, false);
      socket.ping();
    });
  }, HEARTBEAT_MS);
  setInterval(() => {
    const { queueSize, gameCount, finishedCount } = lobby;
    log('stats', {
      connections: sockets.size,
      queueSize,
      games: gameCount,
      finished: finishedCount,
    });
  }, STATS_MS);
  server.listen(PORT, () => {
    console.log(`game server on :${PORT} (next: ${SERVE_NEXT})`);
  });
};

start();
