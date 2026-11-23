import fs from 'fs';
import path from 'path';
import type { NextApiRequest, NextApiResponse } from 'next';
import { parseArtName } from '../../../scripts/art/crop';
import { INBOX, findMaster } from '../../../scripts/art/master-file';
import { devOnly } from '../../../scripts/art/dev-guard';
import { canonicalCardId } from '../../../components/art-lab/lookup';

export const config = { api: { bodyParser: false } };

const TYPES: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
};

/** Art lab: GET ?id= sends the master picture from art-inbox/; POST ?id=&ext=png with the raw file as the body saves one there. Dev only. */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!devOnly(req, res)) return;
  const id = canonicalCardId(String(req.query.id || ''));
  if (!parseArtName(`${id}.png`))
    return void res.status(400).json({ error: 'id must look like CORE_117' });
  try {
    if (req.method === 'GET') {
      const file = findMaster(id);
      if (!file) return void res.status(404).json({ error: 'no master' });
      res.setHeader(
        'Content-Type',
        TYPES[path.extname(file).slice(1).toLowerCase()] ||
          'application/octet-stream',
      );
      res.setHeader('Cache-Control', 'no-store');
      return void res.status(200).send(fs.readFileSync(file));
    }
    if (req.method === 'POST') {
      const ext = String(req.query.ext || 'png').toLowerCase();
      if (!TYPES[ext])
        return void res.status(400).json({ error: 'png, jpg or webp only' });
      const chunks: Buffer[] = [];
      for await (const c of req) chunks.push(c as Buffer);
      const body = Buffer.concat(chunks);
      if (!body.length)
        return void res.status(400).json({ error: 'empty upload' });
      const old = findMaster(id);
      if (old) fs.unlinkSync(old); // one master per card, so "the master" is never ambiguous
      fs.mkdirSync(INBOX, { recursive: true });
      fs.writeFileSync(path.join(INBOX, `${id}.${ext}`), body);
      return void res.status(200).json({
        saved: `${INBOX}/${id}.${ext}`,
        kb: Math.round(body.length / 1024),
      });
    }
    res.status(405).json({ error: 'GET or POST only' });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
}
