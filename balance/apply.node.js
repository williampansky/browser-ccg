// usage: node balance/apply.node.js balance/proposal-1.json [balance/proposal-2.json ...]
// Applies in order to data/core.json (in place; `git checkout data/core.json` undoes).
const fs = require('fs');
const f = 'data/core.json';
const c = JSON.parse(fs.readFileSync(f, 'utf8'));
for (const file of process.argv.slice(2)) {
  for (const [id, ch] of Object.entries(JSON.parse(fs.readFileSync(file, 'utf8')))) {
    const card = c.find((x) => x.id === id);
    if (!card) throw new Error('no card ' + id);
    for (const [k, v] of Object.entries(ch)) if (k !== 'why') card[k] = v;
  }
}
fs.writeFileSync(f, JSON.stringify(c, null, 2) + '\n');
