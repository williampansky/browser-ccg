import fs from 'fs';
import path from 'path';
import { parseArtName } from './crop';

export const INBOX = 'art-inbox';

/** The master for a card id: `art-inbox/CORE_122.<ext>`, or the one in `art-inbox/done/`. Null if there is none. */
export const findMaster = (id: string, root = process.cwd()): string | null => {
  for (const dir of [path.join(root, INBOX), path.join(root, INBOX, 'done')]) {
    if (!fs.existsSync(dir)) continue;
    const hit = fs.readdirSync(dir).find((f) => parseArtName(f)?.id === id.toUpperCase());
    if (hit) return path.join(dir, hit);
  }
  return null;
};

/** Like `npm run art`: once a master has been cut, it moves from `art-inbox/` to `art-inbox/done/` (the lab still finds it there). Returns the new path. */
export const moveToDone = (file: string, root = process.cwd()): string => {
  const done = path.join(root, INBOX, 'done');
  if (path.dirname(file) === done) return file;
  fs.mkdirSync(done, { recursive: true });
  const target = path.join(done, path.basename(file));
  fs.renameSync(file, target);
  return target;
};
