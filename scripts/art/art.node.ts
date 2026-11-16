/**
 * `npm run art`: turns the master pictures in `art-inbox/` into the files the game reads.
 *
 *   art-inbox/CORE_117.png   ->  public/images/sets/SET_CORE/117-CARD.jpg    (1000 x 1000)
 *                                 public/images/sets/SET_CORE/117-DECK.jpg    (600 x 75 strip)
 *                                 public/images/sets/SET_CORE/117-MINION.jpg  (640 x 800), only if the card already has one, or with --minion
 *
 * Masters are named by card id (`CORE_117.png`, `PRIME_029.jpg`, `PRIME_099a.webp`). Where the strip and the portrait are cut from is
 * `art-focus.json` ({ "CORE_117": { "x": 0.5, "y": 0.3, "zoom": 1.4 } }; x and y are 0 to 1 across the picture, zoom 1 or more; leave a card out for the
 * default). Done masters move to `art-inbox/done/` so a second run does nothing.
 *
 *   npm run art                      process everything in art-inbox/
 *   npm run art -- CORE_117          only that card (also re-does one from art-inbox/done/)
 *   npm run art -- --minion          also write the MINION file for cards that have none
 *   npm run art -- --dry             show what would be written, write nothing
 *   npm run art -- --keep            leave the masters where they are
 */
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { ArtKind, DEFAULT_FOCUS, Focus, OUTPUTS, cropBox, outputPath, parseArtName } from './crop';

const INBOX = 'art-inbox';
const DONE = path.join(INBOX, 'done');
const FOCUS_FILE = 'art-focus.json';
const QUALITY = 86;

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith('--')));
const wanted = args.filter((a) => !a.startsWith('--')).map((a) => a.toUpperCase());

const loadFocus = (): Record<string, Partial<Focus>> => {
  try {
    return JSON.parse(fs.readFileSync(FOCUS_FILE, 'utf8'));
  } catch {
    return {};
  }
};

const run = async () => {
  if (!fs.existsSync(INBOX)) {
    fs.mkdirSync(INBOX, { recursive: true });
    console.log(`Made ${INBOX}/. Put a master picture in it named by card id (CORE_117.png), then run this again.`);
    return;
  }
  const focusData = loadFocus();
  const pool = [INBOX, ...(wanted.length && fs.existsSync(DONE) ? [DONE] : [])].flatMap((dir) =>
    fs.readdirSync(dir).map((f) => ({ dir, file: f }))
  );
  const jobs = pool.flatMap(({ dir, file }) => {
    const name = parseArtName(file);
    return name && (!wanted.length || wanted.includes(name.id)) ? [{ dir, file, name }] : [];
  });
  const skipped = fs.readdirSync(INBOX).filter((f) => fs.statSync(path.join(INBOX, f)).isFile() && !f.startsWith('.') && !parseArtName(f));
  skipped.forEach((f) => console.log(`skipped ${f}: not named like CORE_117.png`));
  if (!jobs.length) {
    console.log(wanted.length ? `Nothing in ${INBOX}/ matches ${wanted.join(', ')}.` : `Nothing to do: ${INBOX}/ has no masters.`);
    return;
  }

  for (const { dir, file, name } of jobs) {
    const src = path.join(dir, file);
    const target = path.dirname(outputPath(name, 'card'));
    if (!fs.existsSync(target)) {
      console.log(`${name.id}: no folder ${target}, skipped`);
      continue;
    }
    const meta = await sharp(src).metadata();
    const { width = 0, height = 0 } = meta;
    const focus: Focus = { ...DEFAULT_FOCUS, ...focusData[name.id] };
    const kinds: ArtKind[] = ['card', 'deck'];
    if (flags.has('--minion') || fs.existsSync(outputPath(name, 'minion'))) kinds.push('minion');
    const note = width !== height ? ` (master is ${width}x${height}, not square: cut by focus)` : '';
    for (const kind of kinds) {
      const out = OUTPUTS[kind];
      // The card keeps the whole picture, so it ignores zoom; the strip and the portrait use the card's focus point and zoom.
      const box = cropBox(width, height, out.width / out.height, kind === 'card' ? { ...focus, zoom: 1 } : focus);
      const file = outputPath(name, kind);
      if (flags.has('--dry')) {
        console.log(`${name.id}: would write ${file} from ${JSON.stringify(box)}${note}`);
        continue;
      }
      await sharp(src).extract(box).resize(out.width, out.height).jpeg({ quality: QUALITY, mozjpeg: true }).toFile(file);
      console.log(`${name.id}: wrote ${file} (${Math.round(fs.statSync(file).size / 1024)} KB)${kind === 'card' ? note : ''}`);
    }
    if (!flags.has('--dry') && !flags.has('--keep') && dir === INBOX) {
      fs.mkdirSync(DONE, { recursive: true });
      fs.renameSync(src, path.join(DONE, file));
    }
  }
};

run().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
