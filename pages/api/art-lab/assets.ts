import fs from 'fs';
import path from 'path';
import type { NextApiRequest, NextApiResponse } from 'next';
import { devOnly } from '../../../scripts/art/dev-guard';

const ROOT = path.join(process.cwd(), 'art-assets');
const TYPES: Record<string, string> = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif', svg: 'image/svg+xml' };

const walk = (dir: string, out: string[] = []): string[] => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.')) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (TYPES[path.extname(e.name).slice(1).toLowerCase()]) out.push(path.relative(ROOT, p));
  }
  return out;
};

/** Art lab Assets tab: GET lists images under art-assets/ (subfolders included); GET ?file=sub/x.png sends one. Dev only. */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!devOnly(req, res)) return;
  try {
    const file = req.query.file;
    if (typeof file === 'string') {
      const full = path.resolve(ROOT, file);
      const type = TYPES[path.extname(full).slice(1).toLowerCase()];
      if (!full.startsWith(ROOT + path.sep) || !type || !fs.existsSync(full)) return void res.status(404).json({ error: 'not found' });
      res.setHeader('Content-Type', type);
      res.setHeader('Cache-Control', 'no-store');
      return void res.status(200).send(fs.readFileSync(full));
    }
    const files = fs.existsSync(ROOT) ? walk(ROOT).sort() : [];
    res.status(200).json({ files, exists: fs.existsSync(ROOT) });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
}
