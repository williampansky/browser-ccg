/**
 * `npm run fxsprite -- <source> <id> "<label>" [--tip=-45] [--dry]`: adds a
 * picture to the spell effects' picture list (daggers, axes, potions, shields).
 *
 * `<source>` is either the path to a transparent PNG, or `<pack>:<icon>` for
 * one of the purchased icon packs (`weapon-armor-01:9146`, `weapon-armor-04`,
 * `gems`, `potion`, `loot`), read from its `transparent` folder under
 * `~/Downloads/ICONS_BADGES` (set `ICONS_DIR` to use another folder; find
 * icons with `npm run asset -- axe`). The picture is trimmed, scaled to
 * 192 px and written to `public/images/fx/sprites/<id>.png`, and an entry is
 * added to `SPELL_FX_SPRITES` in components/play-board/spell-fx-sprites.ts.
 *
 * `--tip` is the way the picture's point faces, in degrees on screen (0 =
 * right, -90 = up, 90 = down, 135 = down-left); the default, -45, is a blade
 * drawn pointing to the upper right, as most weapon icons are. Round things
 * (a potion, a skull) have no point: use any tip and give the spell a spin.
 * Check a new picture in the spells lab (Travel > Picture) and fix its `tip`
 * in the list if it points off.
 *
 *   npm run fxsprite -- weapon-armor-01:9146 axe-skull "Skull battle axe"
 *   npm run fxsprite -- ./my-dagger.png dagger-mine "My dagger" --tip=135
 */
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SPRITES_FILE = path.join(
  ROOT,
  'components',
  'play-board',
  'spell-fx-sprites.ts',
);
const OUT_DIR = path.join(ROOT, 'public', 'images', 'fx', 'sprites');
const ICONS_DIR =
  process.env.ICONS_DIR || path.join(os.homedir(), 'Downloads', 'ICONS_BADGES');
const PACK_DIRS = {
  'weapon-armor-01': 'rpg-weapon-and-armor-01',
  'weapon-armor-04': 'rpg-weapon-and-armor-04',
  gems: 'rpg-gems-icons',
  potion: 'rpg-potion-icons',
  loot: 'rpg-loot-icons-01',
};
const SIZE = 192;
const DEFAULT_TIP = -45;

/** The PNG for `<pack>:<icon>`, matched without regard to case. */
const packFile = (source) => {
  const [pack, icon] = source.split(':');
  const dir = PACK_DIRS[pack];
  if (!dir || !icon) return null;
  const folder = path.join(ICONS_DIR, dir, 'transparent');
  if (!fs.existsSync(folder)) return null;
  const found = fs
    .readdirSync(folder)
    .find((file) => file.toLowerCase() === `${icon}.png`.toLowerCase());
  return found ? path.join(folder, found) : null;
};

/** The entry text for the array. */
const entryText = (id, label, tip) =>
  `  { id: '${id}', label: '${label.replace(/'/g, "\\'")}', tip: ${tip} },\n`;

const plan = ({ id, label, tip, existing }) => {
  const errors = [];
  if (!/^[a-z0-9-]+$/.test(id))
    errors.push('id: use lowercase letters, digits and dashes');
  if (!label) errors.push('label: give the picture a name');
  if (!Number.isFinite(tip)) errors.push('--tip: expected a number of degrees');
  if (existing.includes(`id: '${id}'`))
    errors.push(`id: "${id}" is already in the list`);
  return errors;
};

const main = async () => {
  const args = process.argv.slice(2);
  const isDry = args.includes('--dry');
  const tipArg = args.find((arg) => arg.startsWith('--tip='));
  const tip = tipArg ? Number(tipArg.slice('--tip='.length)) : DEFAULT_TIP;
  const [source, id, label] = args.filter((arg) => !arg.startsWith('--'));
  if (!source || !id || !label) {
    console.error(
      'Usage: npm run fxsprite -- <png | pack:icon> <id> "<label>" [--tip=-45] [--dry]',
    );
    process.exit(1);
  }
  const file = fs.existsSync(source) ? source : packFile(source);
  const src = fs.readFileSync(SPRITES_FILE, 'utf8');
  const errors = plan({ id, label, tip, existing: src });
  if (!file)
    errors.push(
      `source: no PNG at "${source}" (and not a pack:icon in ${ICONS_DIR})`,
    );
  const marker = '\n];\n\n/** The picture with this id';
  if (!src.includes(marker))
    errors.push('could not find the end of SPELL_FX_SPRITES');
  if (errors.length) {
    console.error('Nothing written:\n  ' + errors.join('\n  '));
    process.exit(1);
  }
  console.log(
    `${isDry ? 'Would add' : 'Adding'} ${id} (${label}, tip ${tip}) from ${file}`,
  );
  if (isDry) return;
  // sharp is loaded here, not at the top, so a dry run needs nothing.
  const sharp = require('sharp');
  fs.mkdirSync(OUT_DIR, { recursive: true });
  await sharp(file)
    .trim()
    .resize(SIZE, SIZE, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUT_DIR, `${id}.png`));
  const at = src.indexOf(marker);
  fs.writeFileSync(
    SPRITES_FILE,
    src.slice(0, at + 1) + entryText(id, label, tip) + src.slice(at + 1),
  );
  console.log(
    'Added. It is in the spells lab drop-down now; check which way it points.',
  );
};

module.exports = { plan, entryText };
if (require.main === module) main();
