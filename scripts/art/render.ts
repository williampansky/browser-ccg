/**
 * Writes the game's art files from one master picture, one focus per kind (the
 * art lab's "Write images"). The same crop maths and sizes
 * as `npm run art` (crop.ts), but each of card / deck / minion can be framed on
 * its own. Needs `sharp`, so server side only.
 */
import fs from 'fs';
import path from 'path';
import {
  ArtKind,
  DEFAULT_FOCUS,
  Focus,
  OUTPUTS,
  cropBox,
  outputPath,
  parseArtName,
} from './crop';

const QUALITY = 86;

export type FocusByKind = Partial<Record<ArtKind, Focus>>;

export interface Written {
  kind: ArtKind;
  file: string;
  kb: number;
}

/**
 * Cuts `src` into the requested kinds. Throws for an id that is not a card id
 * or a set folder that does not exist.
 */
export const renderArt = async (
  id: string,
  src: string,
  focus: FocusByKind,
  root = process.cwd(),
): Promise<Written[]> => {
  const name = parseArtName(`${id}.png`);
  if (!name) throw new Error(`"${id}" is not a card id like CORE_117`);
  if (!fs.existsSync(path.join(root, path.dirname(outputPath(name, 'card')))))
    throw new Error(`No art folder for ${id}`);
  // Loaded here, not at the top, so the routes that only read cards never need the native module. A runtime `require` (not an `import`):
  // Next's server bundle turned `import 'sharp'` into an ES-module import that Node could not resolve ("Cannot find package .../sharp/index.js").
  // webpack rewrites `require` and `createRequire`, so this goes through eval to reach Node's own `require`.
  // eslint-disable-next-line no-eval
  const sharp: typeof import('sharp').default = eval('require')('sharp');
  const { width = 0, height = 0 } = await sharp(src).metadata();
  const written: Written[] = [];
  for (const kind of Object.keys(focus) as ArtKind[]) {
    const out = OUTPUTS[kind];
    if (!out) continue;
    const box = cropBox(width, height, out.width / out.height, {
      ...DEFAULT_FOCUS,
      ...focus[kind],
    });
    const file = path.join(root, outputPath(name, kind));
    await sharp(src)
      .extract(box)
      .resize(out.width, out.height)
      .jpeg({ quality: QUALITY, mozjpeg: true })
      .toFile(file);
    written.push({
      kind,
      file: outputPath(name, kind),
      kb: Math.round(fs.statSync(file).size / 1024),
    });
  }
  return written;
};
