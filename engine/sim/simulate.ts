import type { CardCatalog } from '../cards/types';
import type { Rng } from '../rng';
import { createSeededRng } from '../rng';
import { applyAction } from '../rules/apply-action';
import { createGame } from '../state/create-game';
import type { Action, GameState, PlayerId } from '../state/types';

/** Anything that picks the active player's next action. */
export type Bot = (state: GameState, catalog: CardCatalog, rng: Rng) => Action;

export interface GameResult {
  winner: PlayerId | 'draw';
  turns: number;
  /** Card ids each player played from hand during the game */
  played: Record<PlayerId, string[]>;
}

const STEP_LIMIT = 8000;

/** Plays one full game. `seed` fixes the shuffles and the bots' choices; player '0' goes first. */
export const playGame = (
  decks: Record<PlayerId, string[]>,
  bots: Record<PlayerId, Bot>,
  catalog: CardCatalog,
  seed: number
): GameResult => {
  const rng = createSeededRng(seed);
  let s = createGame({ decks, firstPlayer: '0', secondPlayerBonusCard: 'GAME_001' }, rng);
  for (let steps = 0; s.status === 'playing'; steps++) {
    if (steps > STEP_LIMIT) throw new Error(`game with seed ${seed} did not finish`);
    const r = applyAction(s, bots[s.activePlayer](s, catalog, rng), { rng, catalog });
    if ('error' in r) throw new Error(`illegal bot action (seed ${seed}): ${r.error}`);
    s = r.state;
  }
  return { winner: s.winner as PlayerId | 'draw', turns: s.turn, played: s.played };
};

export interface Contestant {
  name: string;
  deck: string[];
  bot: Bot;
}

export interface MatchupResult {
  a: string;
  b: string;
  games: number;
  /** Wins for `a`, with a draw counting half */
  aWins: number;
  averageTurns: number;
}

/** `games` games between two contestants, alternating who goes first, so neither side gets the tempo edge. */
export const playMatchup = (
  a: Contestant,
  b: Contestant,
  games: number,
  catalog: CardCatalog,
  seedBase = 1,
  onGame?: (result: GameResult, seats: Record<PlayerId, Contestant>) => void
): MatchupResult => {
  let aWins = 0;
  let turns = 0;
  for (let i = 0; i < games; i++) {
    const aFirst = i % 2 === 0;
    const sides = aFirst ? { '0': a, '1': b } : { '0': b, '1': a };
    const r = playGame(
      { '0': sides['0'].deck, '1': sides['1'].deck },
      { '0': sides['0'].bot, '1': sides['1'].bot },
      catalog,
      seedBase + i
    );
    turns += r.turns;
    onGame?.(r, sides);
    const aSide: PlayerId = aFirst ? '0' : '1';
    aWins += r.winner === 'draw' ? 0.5 : r.winner === aSide ? 1 : 0;
  }
  return { a: a.name, b: b.name, games, aWins, averageTurns: turns / games };
};

export interface CardStat {
  cardId: string;
  /** Games in which this card was played by a contestant */
  games: number;
  wins: number;
}

/** Plays the contestants against each other (every pair, alternating seats) and tallies per-card results. */
export const runTournament = (contestants: Contestant[], gamesPerPair: number, catalog: CardCatalog) => {
  const matchups: MatchupResult[] = [];
  const cardStats = new Map<string, CardStat>();
  const tally = (r: GameResult) => {
    for (const p of ['0', '1'] as PlayerId[]) {
      for (const id of new Set(r.played[p])) {
        const stat = cardStats.get(id) ?? { cardId: id, games: 0, wins: 0 };
        stat.games += 1;
        stat.wins += r.winner === 'draw' ? 0.5 : r.winner === p ? 1 : 0;
        cardStats.set(id, stat);
      }
    }
  };
  for (let i = 0; i < contestants.length; i++) {
    for (let j = i + 1; j < contestants.length; j++) {
      const seed = 1 + (i * contestants.length + j) * 1000;
      matchups.push(playMatchup(contestants[i], contestants[j], gamesPerPair, catalog, seed, (r) => tally(r)));
    }
  }
  return { matchups, cardStats: [...cardStats.values()] };
};

const pct = (x: number) => `${(x * 100).toFixed(0)}%`;

/** A text grid: each cell is the row contestant's win rate against the column contestant. */
export const formatWinTable = (names: string[], matchups: MatchupResult[]): string => {
  const rate = (row: string, col: string): string => {
    if (row === col) return '-';
    const m = matchups.find((x) => (x.a === row && x.b === col) || (x.a === col && x.b === row));
    if (!m) return '?';
    return pct((m.a === row ? m.aWins : m.games - m.aWins) / m.games);
  };
  const width = Math.max(...names.map((n) => n.length), 4) + 2;
  const head = ''.padEnd(width) + names.map((n) => n.padEnd(width)).join('');
  const rows = names.map((r) => r.padEnd(width) + names.map((c) => rate(r, c).padEnd(width)).join(''));
  return [head, ...rows].join('\n');
};
