import { useEffect, useMemo, useState } from 'react';
import { TextInput } from '../ui';

const url = (f: string) => `/api/art-lab/assets?file=${encodeURIComponent(f)}`;

/** Grid of every image in the git-ignored art-assets/ folder; click one to see it large. */
export const AssetGrid = () => {
  const [files, setFiles] = useState<string[] | null>(null);
  const [exists, setExists] = useState(true);
  const [q, setQ] = useState('');
  const [size, setSize] = useState(180);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/art-lab/assets').then((r) => r.json()).then((d) => { setFiles(d.files ?? []); setExists(!!d.exists); }).catch(() => setFiles([]));
  }, []);
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(null);
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [open]);

  const shown = useMemo(() => (files ?? []).filter((f) => f.toLowerCase().includes(q.trim().toLowerCase())), [files, q]);
  if (!files) return <p style={{ opacity: 0.7 }}>Loading...</p>;
  if (!files.length)
    return <p style={{ opacity: 0.7 }}>{exists ? 'art-assets/ has no images yet.' : 'Create an art-assets/ folder in the repo root and drop images in it (png, jpg, webp, gif, svg).'}</p>;
  return (
    <div>
      <div className="ui-controls" style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
        <TextInput aria-label="Filter by file name" placeholder="Filter by name" value={q} onChange={(e) => setQ(e.target.value)} style={{ width: 240 }} />
        <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          Size
          <input type="range" min={80} max={400} value={size} onChange={(e) => setSize(+e.target.value)} />
        </label>
        <span style={{ opacity: 0.7 }}>{shown.length} of {files.length}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${size}px, 1fr))`, gap: 12 }}>
        {shown.map((f) => (
          <figure key={f} style={{ margin: 0 }}>
            <button onClick={() => setOpen(f)} style={{ all: 'unset', cursor: 'zoom-in', display: 'block', width: '100%' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url(f)} alt={f} loading="lazy" style={{ width: '100%', aspectRatio: '1', objectFit: 'contain', background: 'rgba(128,128,128,.15)', borderRadius: 4 }} />
            </button>
            <figcaption style={{ fontSize: 12, opacity: 0.75, wordBreak: 'break-all' }}>{f}</figcaption>
          </figure>
        ))}
      </div>
      {open && (
        <div onClick={() => setOpen(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 1000, cursor: 'zoom-out', gap: 8 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url(open)} alt={open} style={{ maxWidth: '92vw', maxHeight: '88vh', objectFit: 'contain' }} />
          <span style={{ color: '#fff' }}>{open}</span>
        </div>
      )}
    </div>
  );
};
