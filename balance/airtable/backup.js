const fs = require('fs'); const { schema, allRecords } = require('./api');
(async () => {
  const s = await schema(); const dir = 'backups/airtable-claude-code-' + new Date().toISOString().slice(0, 10);
  fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(`${dir}/_schema.json`, JSON.stringify(s, null, 2));
  for (const t of s.tables) { const r = await allRecords(t.id); fs.writeFileSync(`${dir}/${t.name.replace(/[^\w]+/g, '_')}.json`, JSON.stringify(r, null, 2)); console.log(t.name, r.length, 'records'); }
  console.log('backup in', dir);
})().catch((e) => { console.error(e.message); process.exit(1); });
