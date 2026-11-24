/**
 * `npm run asset -- skull poison`: lists the icons in `art-assets/` whose
 * description has every word you give (see `art-assets-catalog.json`). Add
 * `--limit 20` to cap the list.
 */
import fs from 'fs';
import { CatalogPack, findAssets } from './asset-catalog';

const CATALOG = 'art-assets-catalog.json';
const DEFAULT_LIMIT = 40;

const args = process.argv.slice(2);
const limitAt = args.indexOf('--limit');
const limit = limitAt >= 0 ? Number(args[limitAt + 1]) : DEFAULT_LIMIT;
const words = args.filter((arg, index) => {
  return !arg.startsWith('--') && index !== limitAt + 1;
});

const { packs } = JSON.parse(fs.readFileSync(CATALOG, 'utf8')) as {
  packs: CatalogPack[];
};
const matches = findAssets(packs, words);

for (const match of matches.slice(0, limit)) {
  console.log(`${match.file}  ${match.tags}`);
}

console.log(
  `${matches.length} match${matches.length === 1 ? '' : 'es'}` +
    (matches.length > limit ? ` (showing ${limit}; use --limit)` : ''),
);
