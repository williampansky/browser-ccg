/**
 * Pulls the hsclone-era Airtable base ("react-ccg") into `data/hs/*.json`.
 *
 * Usage: `npm run airtable:hs`
 *
 * Needs `AIRTABLE_API_KEY` and `AIRTABLE_BASE_ID` in `./.env.local`, where the
 * base id is the **react-ccg** base (not the older zone-game "browser-ccg" base
 * that `airtable.node.ts` reads).
 *
 * - Writes raw-ish records: Airtable field names are kept as they are, plus
 *   `refId` (the Airtable record id). Nothing is normalised here; the new
 *   engine's loader is responsible for that.
 * - Drops the `inspiration` column. It is private design notes and this repo
 *   is public.
 * - Fetches every table first and writes only if all of them succeed, so a
 *   failure can't leave half-updated files.
 */
// Makes this file a module so its top-level consts don't collide with other scripts.
export {};

// @ts-ignore
require('dotenv').config({ path: './.env.local' });
const fs = require('fs');

const API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = process.env.AIRTABLE_BASE_ID;
const OUT_DIR = './data/hs';

/** Table ids in the react-ccg base, and the file each is written to. */
const TABLES: { name: string; id: string; file: string }[] = [
  { name: 'CONSTANTS', id: 'tbl18M7brE5TLjC3T', file: 'constants' },
  { name: 'MECHANICS', id: 'tbloMPPFzpgijMdcu', file: 'mechanics' },
  { name: 'HEROS', id: 'tblVKCTvym8C5FPQN', file: 'heroes' },
  { name: 'ABILITIES', id: 'tblWTGZCsbJAPh6Uu', file: 'abilities' },
  { name: 'GAME', id: 'tblSz6k2Vi9Yyzi3J', file: 'game' },
  { name: 'CORE', id: 'tblyMx4tVgVaRpceg', file: 'core' },
  { name: 'PRIME', id: 'tblc7FRcIkZi5OnSh', file: 'prime' },
  { name: 'ENTOURAGE', id: 'tblETSSxXNWwteE7Z', file: 'entourage' },
];

const DROPPED_FIELDS = ['inspiration'];

async function fetchAll(tableId: string): Promise<any[]> {
  const records: any[] = [];
  let offset: string | undefined;

  do {
    const url =
      `https://api.airtable.com/v0/${BASE_ID}/${tableId}?pageSize=100` +
      (offset ? `&offset=${offset}` : '');
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });
    const body: any = await res.json();

    if (!body.records) {
      const e = body.error || {};
      throw new Error(
        `${e.type || `HTTP ${res.status}`}: ${e.message || 'no records returned'}`
      );
    }

    records.push(...body.records);
    offset = body.offset;
  } while (offset);

  return records;
}

function clean(record: any) {
  const fields = { ...record.fields };
  DROPPED_FIELDS.forEach((f) => delete fields[f]);
  return { ...fields, refId: record.id };
}

function sortKey(item: any): string {
  return String(item.id ?? item.name ?? item.symbol ?? '');
}

async function main() {
  if (!API_KEY || !BASE_ID) {
    throw new Error('Set AIRTABLE_API_KEY and AIRTABLE_BASE_ID in ./.env.local');
  }

  const results: { file: string; items: any[] }[] = [];

  for (const table of TABLES) {
    process.stdout.write(`Fetching ${table.name} ... `);
    try {
      const records = await fetchAll(table.id);
      const items = records.map(clean).sort((a, b) =>
        sortKey(a).localeCompare(sortKey(b), undefined, { numeric: true })
      );
      console.log(`${items.length} records`);
      results.push({ file: table.file, items });
    } catch (err: any) {
      console.log('FAILED');
      throw new Error(
        `${table.name}: ${err.message}\n` +
          '  Check that AIRTABLE_BASE_ID is the react-ccg base and that the token can read it.'
      );
    }
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  results.forEach(({ file, items }) => {
    fs.writeFileSync(`${OUT_DIR}/${file}.json`, JSON.stringify(items, null, 2) + '\n');
    console.log(`Wrote ${OUT_DIR}/${file}.json`);
  });
}

main().catch((err) => {
  console.error(`\nairtable:hs failed: ${err.message}`);
  process.exit(1);
});
