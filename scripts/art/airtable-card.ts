/**
 * Airtable access for the art lab: read one CARDS row with the field types, and write changed fields back. Server side only (the key
 * in `.env.local` never reaches the browser). The lab never creates or deletes rows.
 */
import fs from 'fs';

export type FieldKind =
  'text' | 'longText' | 'number' | 'checkbox' | 'select' | 'multi';
export interface FieldInfo {
  name: string;
  kind: FieldKind;
  choices?: string[];
}
export type FieldValue = string | number | boolean | string[] | null;

/** Fields the lab does not offer: the row's key, and the ones that decide which file the card lives in. */
export const LOCKED_FIELDS = ['id', 'set', 'isEntourage'];

const loadEnv = () => {
  if (!fs.existsSync('./.env.local')) return;
  for (const line of fs.readFileSync('./.env.local', 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].trim();
  }
};

const creds = () => {
  loadEnv();
  // The lab prefers the _CLAUDE_CODE pair (the token that can write); the plain pair is what `npm run airtable` reads with.
  const key =
    process.env.AIRTABLE_API_KEY_CLAUDE_CODE || process.env.AIRTABLE_API_KEY;
  const base =
    process.env.AIRTABLE_BASE_ID_CLAUDE_CODE || process.env.AIRTABLE_BASE_ID;
  if (!key || !base)
    throw new Error(
      'AIRTABLE_API_KEY_CLAUDE_CODE and AIRTABLE_BASE_ID_CLAUDE_CODE must be set in .env.local',
    );
  return { key, base };
};

const call = async (url: string, init?: RequestInit) => {
  const { key } = creds();
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const hint =
      res.status === 403 && init?.method === 'PATCH'
        ? ' (reads work, so the token probably lacks the data.records:write scope, or this base is not in its access list: edit it at https://airtable.com/create/tokens)'
        : '';
    throw new Error(
      `Airtable ${res.status}: ${JSON.stringify(json.error || json)}${hint}`,
    );
  }
  return json;
};

const KINDS: Record<string, FieldKind> = {
  singleLineText: 'text',
  multilineText: 'longText',
  number: 'number',
  checkbox: 'checkbox',
  singleSelect: 'select',
  multipleSelects: 'multi',
};

/** The editable CARDS fields, in table order. Field types the lab cannot edit (links, formulas...) are left out. */
export const readSchema = async (): Promise<FieldInfo[]> => {
  const { base } = creds();
  const json = await call(
    `https://api.airtable.com/v0/meta/bases/${base}/tables`,
  );
  const table = json.tables.find((t: { name: string }) => t.name === 'CARDS');
  if (!table) throw new Error('No CARDS table in the base');
  return table.fields
    .filter(
      (f: { name: string; type: string }) =>
        KINDS[f.type] && !LOCKED_FIELDS.includes(f.name),
    )
    .map(
      (f: {
        name: string;
        type: string;
        options?: { choices?: { name: string }[] };
      }) => ({
        name: f.name,
        kind: KINDS[f.type],
        ...(f.options?.choices
          ? { choices: f.options.choices.map((c) => c.name) }
          : {}),
      }),
    );
};

export interface CardRow {
  recordId: string;
  fields: Record<string, FieldValue>;
}

export const readCard = async (id: string): Promise<CardRow | null> => {
  const { base } = creds();
  const formula = encodeURIComponent(`{id}='${id.replace(/['\\]/g, '')}'`);
  const json = await call(
    `https://api.airtable.com/v0/${base}/CARDS?maxRecords=2&filterByFormula=${formula}`,
  );
  if (!json.records.length) return null;
  if (json.records.length > 1)
    throw new Error(`More than one CARDS row has id ${id}`);
  return { recordId: json.records[0].id, fields: json.records[0].fields };
};

/**
 * Turns what the form holds into an Airtable update: only fields that are editable, an emptied text/number/select becomes `null`
 * (Airtable's way to clear a cell), a number box holding text is rejected. Pure, so it is unit tested.
 */
export const toUpdate = (
  schema: FieldInfo[],
  changes: Record<string, FieldValue | undefined>,
): Record<string, FieldValue> => {
  const out: Record<string, FieldValue> = {};
  for (const [name, raw] of Object.entries(changes)) {
    const info = schema.find((f) => f.name === name);
    if (!info) throw new Error(`"${name}" is not an editable CARDS field`);
    if (raw === undefined) continue;
    if (info.kind === 'number') {
      if (raw === null || raw === '') out[name] = null;
      else if (typeof raw === 'number' && Number.isFinite(raw)) out[name] = raw;
      else throw new Error(`${name} must be a number`);
    } else if (info.kind === 'checkbox') out[name] = Boolean(raw);
    else if (info.kind === 'multi') out[name] = Array.isArray(raw) ? raw : [];
    else if (info.kind === 'select') {
      if (raw === null || raw === '') out[name] = null;
      else if (typeof raw === 'string' && info.choices?.includes(raw))
        out[name] = raw;
      else
        throw new Error(`${name}: "${String(raw)}" is not one of its options`);
    } else out[name] = raw === null || raw === '' ? null : String(raw);
  }
  return out;
};

export const writeCard = async (
  recordId: string,
  update: Record<string, FieldValue>,
): Promise<void> => {
  const { base } = creds();
  await call(`https://api.airtable.com/v0/${base}/CARDS/${recordId}`, {
    method: 'PATCH',
    body: JSON.stringify({ fields: update }),
  });
};
