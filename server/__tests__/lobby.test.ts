import { buildDeck, createSeededRng, primePool } from '../../engine';
import { Lobby } from '../lobby';
import type { Connection } from '../lobby';
import type { ServerMessage } from '../protocol';
import { catalog, pool } from '../test-helpers';
import { loadHsCards } from '../../engine';

const { cards } = loadHsCards();

const config = {
  matchmaker: { waitMs: 30000, greedyShare: 0.9 },
  botDelayMs: 0,
  graceMs: 60000,
  keepOverMs: 5000,
};

const makeLobby = (seed = 1): Lobby =>
  new Lobby({
    rng: createSeededRng(seed),
    catalog,
    ordinaryPool: [...pool, ...primePool(cards)],
    allCards: cards,
    config,
  });

const fakeConnection = (): Connection & { got: ServerMessage[] } => {
  const got: ServerMessage[] = [];

  return { got, send: (message) => got.push(message) };
};

const queueMessage = (seed: number) => ({
  t: 'queue' as const,
  deck: buildDeck(pool, createSeededRng(seed)),
  hero: 'FIGHTER',
  name: 'Tester',
  color: 'blue',
});

describe('Lobby', () => {
  it('pairs two searching people into one game with redacted views', () => {
    const lobby = makeLobby();
    const [a, b] = [fakeConnection(), fakeConnection()];
    lobby.connect('a', a);
    lobby.connect('b', b);
    lobby.message('a', queueMessage(1), 0);
    lobby.message('b', queueMessage(2), 0);
    lobby.tick(1);

    expect(lobby.gameCount).toBe(1);
    const matched = [a, b].map((c) => c.got.find((m) => m.t === 'matched'));
    matched.forEach((m) => {
      if (m?.t !== 'matched') throw new Error('not matched');
      expect(m.opponent.isBot).toBe(false);
      const foe = m.view.state.players[m.view.seat === '0' ? '1' : '0'];
      expect(foe.hand.every((card) => card.cardId === '')).toBe(true);
    });
  });

  it('plays a bot after the wait, and never before', () => {
    const lobby = makeLobby();
    const a = fakeConnection();
    lobby.connect('a', a);
    lobby.message('a', queueMessage(1), 0);
    lobby.tick(29999);
    expect(lobby.gameCount).toBe(0);
    lobby.tick(30000);

    const matched = a.got.find((m) => m.t === 'matched');
    expect(matched).toMatchObject({ opponent: { isBot: true } });
  });

  it('starts a bot game at once when asked to skip the queue', () => {
    const lobby = makeLobby();
    const a = fakeConnection();
    lobby.connect('a', a);
    lobby.message('a', { ...queueMessage(1), vsBot: true }, 0);

    expect(lobby.queueSize).toBe(0);
    expect(a.got.map((m) => m.t)).toContain('matched');
    expect(a.got.find((m) => m.t === 'matched')).toMatchObject({
      opponent: { isBot: true },
    });
  });

  it('tells a queued player when a bot will take over', () => {
    const lobby = makeLobby();
    const a = fakeConnection();
    lobby.connect('a', a);
    lobby.message('a', queueMessage(1), 0);

    expect(a.got[0]).toMatchObject({ t: 'queued', botAfterMs: 30000 });
  });

  it('refuses a deck with a card outside the allowed pool', () => {
    const lobby = makeLobby();
    const a = fakeConnection();
    lobby.connect('a', a);
    const bad = queueMessage(1);
    bad.deck[0] = 'CORE_DOES_NOT_EXIST';
    lobby.message('a', bad, 0);

    expect(a.got).toEqual([{ t: 'error', code: 'CARD_NOT_ALLOWED' }]);
    expect(lobby.queueSize).toBe(0);
  });

  it('concedes for a person who stays away past the grace period', () => {
    const lobby = makeLobby();
    const [a, b] = [fakeConnection(), fakeConnection()];
    lobby.connect('a', a);
    lobby.connect('b', b);
    lobby.message('a', queueMessage(1), 0);
    lobby.message('b', queueMessage(2), 0);
    lobby.tick(1);
    lobby.disconnect('a', 1000);
    lobby.tick(60999);
    const isOver = (m: ServerMessage) =>
      m.t === 'update' && m.view.state.status === 'over';
    expect(b.got.some(isOver)).toBe(false);
    lobby.tick(61000);

    const last = b.got[b.got.length - 1];
    expect(last).toMatchObject({
      t: 'update',
      view: { state: { status: 'over' } },
    });
  });

  it('puts a person who comes back inside the grace period back in the game', () => {
    const lobby = makeLobby();
    const [a, b] = [fakeConnection(), fakeConnection()];
    lobby.connect('a', a);
    lobby.connect('b', b);
    lobby.message('a', queueMessage(1), 0);
    lobby.message('b', queueMessage(2), 0);
    lobby.tick(1);
    const isOver = (m: ServerMessage) =>
      m.t === 'update' && m.view.state.status === 'over';
    lobby.disconnect('a', 1000);
    const again = fakeConnection();
    lobby.connect('a', again);
    lobby.tick(120000);

    expect(again.got[0]).toMatchObject({ t: 'matched' });
    expect(b.got.some(isOver)).toBe(false);
  });
});
