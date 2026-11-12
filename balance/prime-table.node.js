// usage: node balance/prime-table.node.js <prime-rows.json> <both-rows.json> > balance/PRIME-CARDS.md
// Builds the PRIME card win-rate tables from two merged inclusion runs (see balance/run-incl.sh and merge.node.js ... json).
const fs = require('fs');
const prime = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const both = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
const mixedRate = Object.fromEntries(both.map((r) => [r.id, r.r]));
const pct = (x) => (x * 100).toFixed(1);
const row = (r) => `| ${r.id.slice(6)} | ${r.name} | ${r.type} | ${r.cost} | ${pct(r.r)}% | ${pct(mixedRate[r.id] ?? NaN)}% | ${(r.play * 100).toFixed(0)}% |`;
const head = '| id | card | type | cost | win % (Prime decks) | win % (mixed decks) | played when in deck |\n| --- | --- | --- | --- | --- | --- | --- |';
const sorted = [...prime].sort((a, b) => b.r - a.r);
const out = [];
const mean = (xs) => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length);
out.push('# PRIME card win rates (2026-11-12)\n');
out.push(`Random 30-card decks drawn from the playable PRIME pool (${prime.length} cards), greedy bot vs greedy bot, 12,000 games; then the same on Core + Prime decks (${both.length} cards, 12,000 games). A card\'s win rate is how often the deck it was in won (a draw counts half). With about 3,600 games per card the noise is about +-1.6 points (95%); in the mixed run about +-2. Cards within 3 points of 50% are not distinguishable from average. "Played when in deck" is how often the bot actually played the card in games where it was in the deck: a low number means the bot rarely uses it, so its win rate says little about the card (a dead card pulls its deck down).\n`);
out.push('**Mysteries read as "played 0-13%" but that is a measurement artifact:** a face-down Mystery is deliberately not added to the cards-played history the sim reads, so the column is meaningless for them (the bot does place them since the 2026-11-12 fix; see `DECK-SIMS.md`).\n');
out.push('Method: `balance/run-incl.sh <name> none 1000 prime|both`, then `node balance/merge.node.js /tmp/incl/<name>- none json`, then `node balance/prime-table.node.js`.\n');
const sd = Math.sqrt(mean(prime.map((r) => (r.r - 0.5) ** 2)));
out.push(`Spread of PRIME card win rates (rms from 50%): ${(sd * 100).toFixed(2)} points (CORE was 2.15 before the balance pass).\n`);
out.push('## The 25 best\n\n' + head + '\n' + sorted.slice(0, 25).map(row).join('\n') + '\n');
out.push('## The 25 worst\n\n' + head + '\n' + sorted.slice(-25).reverse().map(row).join('\n') + '\n');
const dead = prime.filter((r) => r.play < 0.35).sort((a, b) => a.play - b.play);
out.push(`## Cards the bot rarely plays (under 35% of the games they were in): ${dead.length}\n\nTheir win rates are mostly the bot's gap, not the cards' (the Mystery, Overcharge, item and discount cards cluster here).\n\n` + head + '\n' + dead.map(row).join('\n') + '\n');
// by mechanic
const mech = {};
for (const r of prime) for (const m of r.mechanics) (mech[m] ??= []).push(r);
const mrows = Object.entries(mech).filter(([, rs]) => rs.length >= 4).map(([m, rs]) => ({ m, n: rs.length, r: mean(rs.map((x) => x.r)), play: mean(rs.map((x) => x.play)) })).sort((a, b) => b.r - a.r);
out.push('## By mechanic tag (cards with at least 4 per tag; a card counts under every tag it has)\n\n| tag | cards | mean win % | mean played |\n| --- | --- | --- | --- |\n' + mrows.map((x) => `| ${x.m} | ${x.n} | ${pct(x.r)}% | ${(x.play * 100).toFixed(0)}% |`).join('\n') + '\n');
const byCost = {};
for (const r of prime) (byCost[Math.min(r.cost, 9)] ??= []).push(r);
out.push('## By cost\n\n| cost | cards | mean win % |\n| --- | --- | --- |\n' + Object.keys(byCost).sort((a, b) => a - b).map((c) => `| ${c === '9' ? '9+' : c} | ${byCost[c].length} | ${pct(mean(byCost[c].map((x) => x.r)))}% |`).join('\n') + '\n');
const byType = {};
for (const r of prime) (byType[r.type] ??= []).push(r);
out.push('## By type\n\n| type | cards | mean win % | mean played |\n| --- | --- | --- | --- |\n' + Object.entries(byType).map(([t, rs]) => `| ${t} | ${rs.length} | ${pct(mean(rs.map((x) => x.r)))}% | ${(mean(rs.map((x) => x.play)) * 100).toFixed(0)}% |`).join('\n') + '\n');
// core vs prime in the mixed run
const mc = both.filter((r) => r.set === 'CORE'), mp = both.filter((r) => r.set === 'PRIME');
out.push(`## CORE against PRIME in mixed decks\n\nIn the mixed run the average CORE card wins ${pct(mean(mc.map((r) => r.r)))}% of its games and the average PRIME card ${pct(mean(mp.map((r) => r.r)))}% (${mc.length} and ${mp.length} cards). The mixed decks hold about 9% CORE and 9% PRIME cards each, so this is the set-vs-set power difference as the bot plays them.\n`);
const biggestGap = [...mp].sort((a, b) => b.r - a.r);
out.push(`## What it says

- **PRIME's cards are about as tight as CORE was before its balance pass** (rms spread ${(sd * 100).toFixed(2)} points against 2.15), and **Core and Prime cards are even** in mixed decks (49.9% against 50.1%). No mechanic family averages outside 48.7% to 52.2%. So the lopsided deck results in \`DECK-SIMS.md\` (Swarm and Guardians winning about 85%) come from *synergy and curve* inside those decks, not from a few overpowered cards.
- **Three clear outliers on the high side** (about +10 points, well past the noise): 157 The Wrong Door (60%), 070 Rusted Warden (60%) and 167 Sorcerer's Dance (59%). All three hold up in mixed decks (63%, 61%, 59%). The next group (251, 169, 055, 154, 227) is at 54% to 55%.
- **The low side is shallow:** the worst card is 45.5% (229 Rai'Ki), and most of the bottom 25 are cards the bot barely plays (Warpipe, Ring of the Lucii, Crystal of Virtue and Cursed Concoction were played in under 2% of their games), so their numbers measure the bot, not the cards.
- **Cost curve is flat** (49.2% to 51.9%), which is what a tuned set looks like.
- **Nothing was changed on this evidence.** The three outliers are the obvious first candidates for a trim if you agree they play too well; the cheapest one to look at is The Wrong Door (a 1-mana Mystery that always lands two Guard Mice).
`);
process.stdout.write(out.join('\n'));
