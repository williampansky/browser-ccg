import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Checkbox, Group, Select, TextInput } from '../ui';
import { CardLookup } from './CardLookup';
import { ArtKind, DEFAULT_FOCUS, Focus, OUTPUTS, cropBox } from '../../scripts/art/crop';
const LOCKED = ['id', 'set', 'isEntourage']; // same list as LOCKED_FIELDS in scripts/art/airtable-card.ts (that module uses fs, so it can't be imported here)
import type { FieldInfo, FieldValue } from '../../scripts/art/airtable-card';

type Fields = Record<string, FieldValue>;
interface CardResponse {
  id: string;
  recordId: string;
  fields: Fields;
  schema: FieldInfo[];
  hasMaster: boolean;
}

const KINDS: ArtKind[] = ['card', 'minion', 'deck'];
const PREVIEW_W: Record<ArtKind, number> = { card: 260, deck: 480, minion: 208 };
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

const api = async (url: string, init?: RequestInit) => {
  const res = await fetch(url, init);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || `HTTP ${res.status} (the server crashed; see the terminal running npm run dev)`);
  return json;
};
const post = (url: string, body: unknown) => api(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

/** One crop: the master shown through the output's frame (drag to move it, sliders to zoom); the file on disk now sits beside it. */
const CropPanel = ({ kind, src, size, focus, onFocus, current, on, onOn }: {
  kind: ArtKind;
  src: string;
  size: { w: number; h: number };
  focus: Focus;
  onFocus: (f: Focus) => void;
  current: string;
  on: boolean;
  onOn: (on: boolean) => void;
}) => {
  const out = OUTPUTS[kind];
  const W = PREVIEW_W[kind];
  const H = Math.round((W * out.height) / out.width);
  const box = cropBox(size.w, size.h, out.width / out.height, focus);
  const scale = W / box.width;
  const drag = useRef<{ x: number; y: number; f: Focus } | null>(null);
  return (
    <Group style={{ padding: 12, marginBottom: 12 }}>
      <Checkbox checked={on} onChange={onOn}>
        {kind.toUpperCase()} ({out.width} x {out.height})
      </Checkbox>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap', marginTop: 8 }}>
        <div>
          <div
            title="Drag to move the crop"
            style={{
              width: W,
              height: H,
              cursor: 'grab',
              touchAction: 'none',
              backgroundImage: `url(${src})`,
              backgroundRepeat: 'no-repeat',
              backgroundSize: `${size.w * scale}px ${size.h * scale}px`,
              backgroundPosition: `${-box.left * scale}px ${-box.top * scale}px`,
              outline: '1px solid #888',
            }}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              drag.current = { x: e.clientX, y: e.clientY, f: focus };
            }}
            onPointerMove={(e) => {
              const d = drag.current;
              if (!d) return;
              // Dragging the picture right moves the crop window left over it, so focus goes the other way.
              onFocus({ ...d.f, x: clamp01(d.f.x - (e.clientX - d.x) / scale / size.w), y: clamp01(d.f.y - (e.clientY - d.y) / scale / size.h) });
            }}
            onPointerUp={() => (drag.current = null)}
          />
          <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>new</div>
        </div>
        <div>
          <img src={current} alt={`current ${kind}`} style={{ width: W, height: H, objectFit: 'cover', outline: '1px solid #888', display: 'block' }} />
          <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>on disk now</div>
        </div>
      </div>
      {(['x', 'y', 'zoom'] as const).map((k) => (
        <label key={k} style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 6, fontSize: 12 }}>
          <span style={{ width: 36 }}>{k}</span>
          <input
            type="range"
            aria-label={`${kind} ${k}`}
            min={k === 'zoom' ? 1 : 0}
            max={k === 'zoom' ? 4 : 1}
            step={0.005}
            value={focus[k]}
            onChange={(e) => onFocus({ ...focus, [k]: Number(e.target.value) })}
            style={{ flex: 1 }}
          />
          <span style={{ width: 40, textAlign: 'right' }}>{focus[k].toFixed(2)}</span>
        </label>
      ))}
    </Group>
  );
};

/** The three files the game reads for this card, straight from public/images/sets (a missing file says so instead of showing a broken image). */
const CurrentArt = ({ urls }: { urls: Record<ArtKind, string> }) => {
  const [missing, setMissing] = useState<Record<string, boolean>>({});
  return (
    <Group style={{ padding: 12, marginBottom: 12 }}>
      <strong>Current art on disk</strong>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start', marginTop: 8 }}>
        {KINDS.map((k) => (
          <figure key={k} style={{ margin: 0 }}>
            {missing[urls[k]] ? (
              <div style={{ width: PREVIEW_W[k] / 2, padding: 8, outline: '1px dashed #888', fontSize: 12 }}>no {k.toUpperCase()} file</div>
            ) : (
              <img src={urls[k]} alt={`current ${k}`} onError={() => setMissing((m) => ({ ...m, [urls[k]]: true }))} style={{ width: PREVIEW_W[k], maxWidth: '100%', display: 'block', outline: '1px solid #888' }} />
            )}
            <figcaption style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>{k.toUpperCase()} ({OUTPUTS[k].width} x {OUTPUTS[k].height})</figcaption>
          </figure>
        ))}
      </div>
    </Group>
  );
};

const FieldEditor = ({ info, value, onChange }: { info: FieldInfo; value: FieldValue | undefined; onChange: (v: FieldValue) => void }) => {
  switch (info.kind) {
    case 'checkbox':
      return <Checkbox checked={!!value} onChange={onChange}>{info.name}</Checkbox>;
    case 'select':
      return (
        <label>
          {info.name}
          <Select aria-label={info.name} value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value || null)} style={{ width: '100%' }}>
            <option value="" />
            {info.choices?.map((c) => <option key={c}>{c}</option>)}
          </Select>
        </label>
      );
    case 'multi': {
      const sel = (value as string[]) ?? [];
      return (
        <details>
          <summary>{info.name} ({sel.length})</summary>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 14px', marginTop: 4 }}>
            {info.choices?.map((c) => (
              <Checkbox key={c} checked={sel.includes(c)} onChange={(on) => onChange(on ? [...sel, c] : sel.filter((s) => s !== c))}>{c}</Checkbox>
            ))}
          </div>
        </details>
      );
    }
    case 'longText':
      return (
        <label>
          {info.name}
          <textarea className="ui-field" aria-label={info.name} rows={3} value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value)} style={{ width: '100%', resize: 'vertical' }} />
        </label>
      );
    case 'number':
      return (
        <label>
          {info.name}
          <TextInput aria-label={info.name} type="number" value={(value as number) ?? ''} onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))} style={{ width: '100%' }} />
        </label>
      );
    default:
      return (
        <label>
          {info.name}
          <TextInput aria-label={info.name} value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value)} style={{ width: '100%' }} />
        </label>
      );
  }
};

export const ArtLab = ({ id }: { id: string }) => {
  const [card, setCard] = useState<CardResponse | null>(null);
  const [edits, setEdits] = useState<Fields>({});
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [masterUrl, setMasterUrl] = useState<string | null>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [focus, setFocus] = useState<Record<ArtKind, Focus>>({ card: { ...DEFAULT_FOCUS }, deck: { ...DEFAULT_FOCUS }, minion: { ...DEFAULT_FOCUS } });
  const [on, setOn] = useState<Record<ArtKind, boolean>>({ card: true, deck: true, minion: true });
  const [pull, setPull] = useState(true);
  const [stamp, setStamp] = useState(Date.now());

  const loadMaster = useCallback(() => setMasterUrl(`/api/art-lab/master?id=${id}&t=${Date.now()}`), [id]);
  useEffect(() => {
    setCard(null);
    setEdits({});
    setMasterUrl(null);
    setSize(null);
    api(`/api/art-lab/card?id=${id}`).then(
      (c: CardResponse) => {
        setCard(c);
        if (c.hasMaster) loadMaster();
      },
      (e) => setMsg(`Could not load ${id}: ${e.message}`)
    );
  }, [id, loadMaster]);
  useEffect(() => {
    if (!masterUrl) return;
    const img = new Image();
    img.onload = () => setSize({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => setMsg('The master picture would not load');
    img.src = masterUrl;
  }, [masterUrl]);

  const run = async (label: string, job: () => Promise<string>) => {
    setBusy(true);
    setMsg(`${label} ...`);
    try {
      setMsg(await job());
    } catch (e) {
      setMsg(`${label} failed: ${(e as Error).message}`);
    }
    setBusy(false);
  };

  const upload = (file: File) =>
    run('Uploading master', async () => {
      const ext = (file.name.split('.').pop() || 'png').toLowerCase();
      const r = await api(`/api/art-lab/master?id=${id}&ext=${ext}`, { method: 'POST', body: file });
      loadMaster();
      return `Saved ${r.saved} (${r.kb} KB)`;
    });

  const [set, num] = id.split('_');
  const fileUrl = (kind: ArtKind) => `/images/sets/SET_${set}/${num}-${OUTPUTS[kind].suffix}.jpg?t=${stamp}`;
  const value = (f: FieldInfo) => (f.name in edits ? edits[f.name] : card?.fields[f.name]);
  const changed = Object.keys(edits);

  return (
    <main style={{ height: '100vh', overflowY: 'auto', boxSizing: 'border-box', padding: '20px 24px 96px' }}>
      <CardLookup current={id} />
      <h1 style={{ margin: 0 }}>
        Art lab: {id}
        {card?.fields.name ? ` · ${card.fields.name}` : ''}
      </h1>
      <p style={{ opacity: 0.7, maxWidth: 760 }}>
        Local dev tool. Left: reframe the picture for each file the game reads. Right: the card&apos;s CARDS row in Airtable; only the fields you change are sent.
      </p>
      {msg && <p role="status" style={{ fontWeight: 600 }}>{msg}</p>}
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <section style={{ flex: '1 1 560px', minWidth: 0 }}>
          <h2>Images</h2>
          <CurrentArt urls={{ card: fileUrl('card'), deck: fileUrl('deck'), minion: fileUrl('minion') }} />
          <label
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files[0];
              if (f) upload(f);
            }}
            style={{ display: 'block', border: '2px dashed #888', padding: 14, marginBottom: 12, textAlign: 'center' }}
          >
            Drop a master picture here, or choose one:{' '}
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
            <div style={{ fontSize: 12, opacity: 0.7 }}>{masterUrl && size ? `Master in art-inbox/: ${size.w} x ${size.h}` : 'No master in art-inbox/ yet'}</div>
          </label>
          {masterUrl && size && (
            <>
              {KINDS.map((k) => (
                <CropPanel
                  key={k}
                  kind={k}
                  src={masterUrl}
                  size={size}
                  focus={focus[k]}
                  onFocus={(f) => setFocus((o) => ({ ...o, [k]: f }))}
                  current={fileUrl(k)}
                  on={on[k]}
                  onOn={(v) => setOn((o) => ({ ...o, [k]: v }))}
                />
              ))}
              <Button
                variant="primary"
                disabled={busy || !KINDS.some((k) => on[k])}
                onClick={() =>
                  run('Writing images', async () => {
                    const r = await post('/api/art-lab/render', { id, focus: Object.fromEntries(KINDS.filter((k) => on[k]).map((k) => [k, focus[k]])) });
                    setStamp(Date.now());
                    return `Wrote ${r.written.map((w: { file: string; kb: number }) => `${w.file} (${w.kb} KB)`).join(', ')}`;
                  })
                }
              >
                Write images
              </Button>
            </>
          )}
        </section>
        <section style={{ flex: '1 1 380px', minWidth: 0 }}>
          <h2>Airtable: CARDS</h2>
          {!card ? (
            <p>Loading ...</p>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {LOCKED.filter((n) => n in card.fields).map((n) => (
                <div key={n} style={{ opacity: 0.7 }}>
                  {n}: {String(card.fields[n])} <small>(locked)</small>
                </div>
              ))}
              {card.schema.map((f) => (
                <div key={f.name} style={f.name in edits ? { borderLeft: '3px solid #d9a400', paddingLeft: 8 } : undefined}>
                  <FieldEditor info={f} value={value(f)} onChange={(v) => setEdits((e) => ({ ...e, [f.name]: v }))} />
                </div>
              ))}
              <Checkbox checked={pull} onChange={setPull}>After saving, pull Airtable into data/ (runs npm run airtable)</Checkbox>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button
                  variant="primary"
                  disabled={busy || !changed.length}
                  onClick={() =>
                    run('Saving to Airtable', async () => {
                      const r = await post('/api/art-lab/card', { id, fields: edits, pull });
                      setCard((c) => c && { ...c, fields: { ...c.fields, ...edits } });
                      setEdits({});
                      return `Saved ${r.saved.join(', ')} to Airtable${r.pulled ? ' and refreshed data/' : ''}`;
                    })
                  }
                >
                  Save {changed.length ? `${changed.length} change${changed.length > 1 ? 's' : ''}` : 'fields'} to Airtable
                </Button>
                <Button disabled={!changed.length} onClick={() => setEdits({})}>Discard</Button>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};
