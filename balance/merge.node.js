// usage: node balance/merge.node.js "<glob prefix>" [patchfiles]  -> table of cards by inclusion win rate
const fs = require('fs');
const prefix = process.argv[2];
const dir = require('path').dirname(prefix), base = require('path').basename(prefix);
const files = fs.readdirSync(dir).filter((f) => f.startsWith(base));
const tot = {}; let games = 0, fw = 0, turns = 0;
for (const f of files) { const j = JSON.parse(fs.readFileSync(dir + '/' + f)); games += j.games; fw += j.firstWins; turns += j.turns;
  for (const [id, s] of Object.entries(j.stats)) { const t = (tot[id] ??= { n: 0, w: 0 }); t.n += s.n; t.w += s.w; t.p = (t.p || 0) + (s.played || 0); } }
const core = require('../data/core.json');
const patches = (process.argv[3] || '').split(',').filter(Boolean);
const card = Object.fromEntries(core.map((c) => [c.id, { ...c }]));
for (const p of patches) for (const [id, ch] of Object.entries(require('../' + p))) for (const [k, v] of Object.entries(ch)) if (k !== 'why') card[id][k] = v;
const rows = Object.entries(tot).map(([id, s]) => { const r = s.w / s.n; return { id, name: card[id].name, cost: card[id].cost, r, se: Math.sqrt(0.25 / s.n), n: s.n, play: (s.p || 0) / s.n }; }).sort((a, b) => b.r - a.r);
if (process.argv[4] === 'json') { console.log(JSON.stringify(rows)); process.exit(); }
console.log(`games ${games}, first-player win ${(100 * fw / games).toFixed(1)}%, avg turns ${(turns / games).toFixed(1)}`);
const sd = Math.sqrt(rows.reduce((a, r) => a + (r.r - 0.5) ** 2, 0) / rows.length);
console.log(`spread of card win rates (rms from 50%): ${(sd * 100).toFixed(2)}%  (noise floor ~${(rows[0].se * 100).toFixed(1)}%)`);
const f = (r) => `${(r.r * 100).toFixed(1)}% ±${(r.se * 200).toFixed(1)} c${r.cost} ${r.id} ${r.name}`;
console.log('TOP'); rows.slice(0, 15).forEach((r) => console.log('  ' + f(r)));
console.log('BOTTOM'); rows.slice(-15).forEach((r) => console.log('  ' + f(r)));
