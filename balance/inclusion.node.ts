// usage: ts-node balance/inclusion.node.ts <patches|none> <games> <seedOffset> <out.json>
// Random 30-card decks, greedy vs greedy. Per card: games its deck was in, and wins (draw = half).
import fs from 'fs';
import core from '../data/core.json';
import prime from '../data/prime.json';
import entourage from '../data/entourage.json';
import game from '../data/game.json';
import mechanics from '../data/mechanics.json';
import constants from '../data/constants.json';
import { loadCards } from '../engine/cards/load-cards';
import { playablePool, buildDeck } from '../engine/decks';
import { chooseGreedyAction } from '../engine/bots/greedy-bot';
import { createSeededRng } from '../engine/rng';
import { playGame } from '../engine/sim/simulate';

const [patchArg, gamesArg, offArg, out] = process.argv.slice(2);
const c: any[] = JSON.parse(JSON.stringify(core));
if (patchArg !== 'none')
  for (const f of patchArg.split(',')) {
    for (const [id, ch] of Object.entries<any>(JSON.parse(fs.readFileSync(f, 'utf8')))) {
      const card = c.find((x) => x.id === id);
      if (!card) throw new Error('no card ' + id);
      for (const [k, v] of Object.entries(ch)) if (k !== 'why') card[k] = v;
    }
  }
const { byId, cards } = loadCards(
  { core: c, prime, entourage, game, mechanics, constants } as any,
  undefined
);
const pool = playablePool(cards);
const stats: Record<string, { n: number; w: number; firstN: number; played: number }> = {};
let firstWins = 0, turns = 0;
const games = Number(gamesArg), off = Number(offArg);
for (let i = 0; i < games; i++) {
  const rng = createSeededRng(off + i * 7919);
  const decks = { '0': buildDeck(pool, rng), '1': buildDeck(pool, rng) } as any;
  const r = playGame(decks, { '0': chooseGreedyAction, '1': chooseGreedyAction }, byId, off + i);
  turns += r.turns;
  if (r.winner === '0') firstWins++;
  for (const p of ['0', '1'] as const) {
    const win = r.winner === 'draw' ? 0.5 : r.winner === p ? 1 : 0;
    for (const id of Array.from(new Set<string>(decks[p]))) {
      const s = (stats[id] ??= { n: 0, w: 0, firstN: 0, played: 0 });
      s.n++; s.w += win; if (r.played[p].includes(id)) s.played++;
    }
  }
}
fs.writeFileSync(out, JSON.stringify({ stats, games, firstWins, turns }));
