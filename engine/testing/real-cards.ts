/** Test helpers for exercising the real CORE definitions against the real card data. */
import { produce } from 'immer';
import { loadHsCards } from '../cards/load-hs-cards';
import type { Card } from '../cards/types';
import { applyAction } from '../rules/apply-action';
import { createGame } from '../state/create-game';
import { createSeededRng } from '../rng';
import type { Action, GameEvent, GameState, PlayerId, TargetRef } from '../state/types';
import { catalogOf, minionCard, putInHand, putOnBoard, setEnergy } from './builders';

const { byId } = loadHsCards();
const grunt = minionCard('GRUNT', { cost: 1, attack: 2, health: 3 });
export const catalog = catalogOf(...Array.from(byId.values()), grunt);
export const realCard = (id: string): Card => {
  const c = byId.get(id);
  if (!c) throw new Error(`no card ${id}`);
  return c;
};

/** [attack, health] of each minion to put on a board, left to right. */
export type BoardSpec = [number, number][];

export interface Scenario {
  mine?: BoardSpec;
  theirs?: BoardSpec;
  /** Extra cards in the active player's hand after the one under test */
  hand?: string[];
  heroHp?: Partial<Record<PlayerId, number>>;
}

/** P0 to move with `cardId` in hand (index 0), 10 energy, and the given boards. Deck: 30 grunts. */
export const setup = (cardId: string, sc: Scenario = {}): GameState => {
  let s = createGame(
    { decks: { '0': Array(30).fill('GRUNT'), '1': Array(30).fill('GRUNT') }, firstPlayer: '0' },
    createSeededRng(1)
  );
  s = { ...s, players: { ...s.players, '0': { ...s.players['0'], hand: [] } } };
  s = putInHand(s, '0', cardId);
  for (const id of sc.hand ?? []) s = putInHand(s, '0', id);
  s = setEnergy(s, '0', 10);
  for (const [player, spec] of [['0', sc.mine], ['1', sc.theirs]] as const) {
    for (const [attack, health] of spec ?? []) {
      s = putOnBoard(s, player, grunt, { attack, health, maxHealth: health });
    }
  }
  return produce(s, (g) => {
    for (const p of ['0', '1'] as PlayerId[]) {
      const hp = sc.heroHp?.[p];
      if (hp !== undefined) g.players[p].health = hp;
    }
  });
};

export const run = (s: GameState, a: Action, seed = 1) =>
  applyAction(s, a, { rng: createSeededRng(seed), catalog });

/** Plays hand slot 0 (optionally aimed); throws on an engine error. */
export const play = (s: GameState, target?: TargetRef, seed = 1): { state: GameState; events: GameEvent[] } => {
  const r = run(s, { type: 'PlayCard', handIndex: 0, target }, seed);
  if ('error' in r) throw new Error(`unexpected ${r.error}`);
  return r;
};

export const failCode = (s: GameState, target?: TargetRef) => {
  const r = run(s, { type: 'PlayCard', handIndex: 0, target });
  return 'error' in r ? r.error : undefined;
};

export const minion = (s: GameState, player: PlayerId, i: number) => s.players[player].board[i];
export const mref = (s: GameState, player: PlayerId, i: number): TargetRef => ({
  kind: 'minion',
  instanceId: s.players[player].board[i].instanceId,
});
export const hero = (player: PlayerId): TargetRef => ({ kind: 'hero', player });
export const stats = (s: GameState, player: PlayerId) => s.players[player].board.map((m) => [m.attack, m.health]);
