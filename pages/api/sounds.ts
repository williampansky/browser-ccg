import fs from 'fs';
import path from 'path';
import type { NextApiRequest, NextApiResponse } from 'next';

const EXT = /\.(ogg|wav|mp3|m4a)$/i;
const walk = (dir: string, base: string): string[] =>
  fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((e) =>
      e.isDirectory()
        ? walk(path.join(dir, e.name), `${base}/${e.name}`)
        : EXT.test(e.name)
          ? [`${base}/${e.name}`]
          : [],
    );

/** The audio files under `public/sounds`, as URLs, for the board lab's sound picker (dev tool). */
export default function handler(
  _req: NextApiRequest,
  res: NextApiResponse<string[]>,
) {
  try {
    res
      .status(200)
      .json(
        walk(path.join(process.cwd(), 'public', 'sounds'), '/sounds').sort(),
      );
  } catch {
    res.status(200).json([]);
  }
}
