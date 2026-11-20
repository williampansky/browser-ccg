import type { NextApiRequest, NextApiResponse } from 'next';
import { findMaster, moveToDone } from '../../../scripts/art/master-file';
import { FocusByKind, renderArt } from '../../../scripts/art/render';
import { devOnly } from '../../../scripts/art/dev-guard';
import { canonicalCardId } from '../../../components/art-lab/lookup';

/** Art lab: POST { id, focus: { card?, deck?, minion? } } writes those images from the card's master in art-inbox/, then moves the master to art-inbox/done/ (as `npm run art` does). Dev only. */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!devOnly(req, res)) return;
  if (req.method !== 'POST') return void res.status(405).json({ error: 'POST only' });
  try {
    const { id, focus } = req.body as { id: string; focus: FocusByKind };
    const master = findMaster(String(id));
    if (!master) return void res.status(404).json({ error: `No master for ${id} in art-inbox/` });
    const written = await renderArt(canonicalCardId(String(id)), master, focus);
    moveToDone(master);
    res.status(200).json({ written });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
}
