import { execFile } from 'child_process';
import fs from 'fs';
import path from 'path';
import type { NextApiRequest, NextApiResponse } from 'next';
import { findMaster } from '../../../scripts/art/master-file';
import {
  FieldValue,
  readCard,
  readSchema,
  toUpdate,
  writeCard,
} from '../../../scripts/art/airtable-card';
import { collectArtists } from '../../../scripts/art/artists';
import { devOnly } from '../../../scripts/art/dev-guard';
import { canonicalCardId } from '../../../components/art-lab/lookup';

/** Artist names/URLs already used in data/*.json (cards and heroes), for the lab's suggestions. */
const artistSuggestions = () => {
  const dir = path.join(process.cwd(), 'data');
  const records: { artistName?: unknown; artistUrl?: unknown }[] = [];
  for (const f of fs.readdirSync(dir).filter((n) => n.endsWith('.json'))) {
    try {
      const json = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
      if (Array.isArray(json))
        records.push(...json.filter((r) => r && typeof r === 'object'));
    } catch {
      // a data file that is not JSON just contributes nothing
    }
  }
  return collectArtists(records);
};

/**
 * Art lab: GET ?id=CORE_122 reads that CARDS row and the editable field types; POST { id, fields } writes only the fields sent
 * (and, with `pull`, re-runs `npm run airtable` so `data/*.json` matches). Dev only.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!devOnly(req, res)) return;
  try {
    if (req.method === 'GET') {
      const id = canonicalCardId(String(req.query.id || ''));
      const [schema, row] = await Promise.all([readSchema(), readCard(id)]);
      if (!row)
        return void res
          .status(404)
          .json({ error: `No CARDS row with id ${id}` });
      return void res.status(200).json({
        id,
        recordId: row.recordId,
        fields: row.fields,
        schema,
        hasMaster: !!findMaster(id),
        artists: artistSuggestions(),
      });
    }
    if (req.method === 'POST') {
      const { id, fields, pull } = req.body as {
        id: string;
        fields: Record<string, FieldValue>;
        pull?: boolean;
      };
      const [schema, row] = await Promise.all([
        readSchema(),
        readCard(canonicalCardId(String(id))),
      ]);
      if (!row)
        return void res
          .status(404)
          .json({ error: `No CARDS row with id ${id}` });
      const update = toUpdate(schema, fields);
      if (!Object.keys(update).length)
        return void res.status(200).json({ saved: [], pulled: false });
      await writeCard(row.recordId, update);
      let pulled = false;
      if (pull) {
        await new Promise<void>((ok, fail) =>
          execFile(
            'node',
            ['airtable.node.js'],
            { cwd: process.cwd() },
            (e, _o, stderr) =>
              e ? fail(new Error(stderr || e.message)) : ok(),
          ),
        );
        pulled = true;
      }
      return void res.status(200).json({ saved: Object.keys(update), pulled });
    }
    res.status(405).json({ error: 'GET or POST only' });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
}
