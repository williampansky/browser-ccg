import { execFile } from 'child_process';
import type { NextApiRequest, NextApiResponse } from 'next';
import { findMaster } from '../../../scripts/art/master-file';
import { FieldValue, readCard, readSchema, toUpdate, writeCard } from '../../../scripts/art/airtable-card';
import { devOnly } from '../../../scripts/art/dev-guard';

/**
 * Art lab: GET ?id=CORE_122 reads that CARDS row and the editable field types; POST { id, fields } writes only the fields sent
 * (and, with `pull`, re-runs `npm run airtable` so `data/*.json` matches). Dev only.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!devOnly(req, res)) return;
  try {
    if (req.method === 'GET') {
      const id = String(req.query.id || '').toUpperCase();
      const [schema, row] = await Promise.all([readSchema(), readCard(id)]);
      if (!row) return void res.status(404).json({ error: `No CARDS row with id ${id}` });
      return void res.status(200).json({ id, recordId: row.recordId, fields: row.fields, schema, hasMaster: !!findMaster(id) });
    }
    if (req.method === 'POST') {
      const { id, fields, pull } = req.body as { id: string; fields: Record<string, FieldValue>; pull?: boolean };
      const [schema, row] = await Promise.all([readSchema(), readCard(String(id).toUpperCase())]);
      if (!row) return void res.status(404).json({ error: `No CARDS row with id ${id}` });
      const update = toUpdate(schema, fields);
      if (!Object.keys(update).length) return void res.status(200).json({ saved: [], pulled: false });
      await writeCard(row.recordId, update);
      let pulled = false;
      if (pull) {
        await new Promise<void>((ok, fail) => execFile('node', ['airtable.node.js'], { cwd: process.cwd() }, (e, _o, stderr) => (e ? fail(new Error(stderr || e.message)) : ok())));
        pulled = true;
      }
      return void res.status(200).json({ saved: Object.keys(update), pulled });
    }
    res.status(405).json({ error: 'GET or POST only' });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
}
