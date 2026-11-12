// Minimal Airtable client for the CLAUDE_CODE base. Reads AIRTABLE_*_CLAUDE_CODE from ./.env.local. Never logs the key.
const fs = require('fs');
for (const line of fs.readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].trim();
}
const KEY = process.env.AIRTABLE_API_KEY_CLAUDE_CODE;
const BASE = process.env.AIRTABLE_BASE_ID_CLAUDE_CODE;
if (!KEY || !BASE) throw new Error('AIRTABLE_API_KEY_CLAUDE_CODE / AIRTABLE_BASE_ID_CLAUDE_CODE missing in .env.local');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function call(method, path, body) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch('https://api.airtable.com/v0' + path, {
      method,
      headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    await sleep(230); // stay under 5 requests/second
    if (res.status === 429) { await sleep(31000); continue; }
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(`${method} ${path.replace(BASE, '<base>')} -> ${res.status} ${JSON.stringify(json.error || json)}`);
    return json;
  }
  throw new Error('rate limited too long');
}
const schema = () => call('GET', `/meta/bases/${BASE}/tables`);
async function allRecords(tableId) {
  const out = []; let offset;
  do {
    const j = await call('GET', `/${BASE}/${tableId}?pageSize=100${offset ? '&offset=' + offset : ''}`);
    out.push(...j.records); offset = j.offset;
  } while (offset);
  return out;
}
module.exports = { call, schema, allRecords, BASE, sleep };
