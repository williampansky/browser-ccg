import { useEffect, useMemo, useState } from 'react';
import { TextInput } from '../ui';
import { AttributionRule, findAttribution } from './attribution';

const url = (f: string) => `/api/art-lab/assets?file=${encodeURIComponent(f)}`;

/**
 * The artist for a file from art-assets-attribution.json, or a dim "no artist"
 * note.
 */
const Credit = ({
  file,
  rules,
  color,
}: {
  file: string;
  rules: AttributionRule[];
  color?: string;
}) => {
  const hit = findAttribution(file, rules);
  return (
    <div style={{ fontSize: 12, color, opacity: hit ? 1 : 0.4 }}>
      {hit ? (
        <>
          by{' '}
          {hit.url ? (
            <a
              href={hit.url}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              {hit.artist}
            </a>
          ) : (
            hit.artist
          )}
        </>
      ) : (
        'no artist'
      )}
    </div>
  );
};

/**
 * Grid of every image in the git-ignored art-assets/ folder;
 * click one to see it large or click its filename to copy it to the clipboard.
 *
 * Dev only.
 */
export const AssetGrid = () => {
  const [copied, setCopied] = useState<string | null>(null);
  const [files, setFiles] = useState<string[] | null>(null);
  const [exists, setExists] = useState(true);
  const [rules, setRules] = useState<AttributionRule[]>([]);
  const [q, setQ] = useState('');
  const [size, setSize] = useState(180);
  const [open, setOpen] = useState<string | null>(null);

  /**
   * Copy the asset's filename to the clipboard.
   */
  const onAssetNameClick = (e: React.MouseEvent, v: string) => {
    // a click anywhere else closes the dialog; this one only copies
    e.stopPropagation();

    navigator.clipboard?.writeText(v).then(() => {
      setCopied(v);
      window.setTimeout(() => setCopied(null), 1200);
    });
  };

  useEffect(() => {
    fetch('/api/art-lab/assets')
      .then((r) => r.json())
      .then((d) => {
        setFiles(d.files ?? []);
        setExists(!!d.exists);
        setRules(d.rules ?? []);
      })
      .catch(() => setFiles([]));
  }, []);

  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(null);
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [open]);

  const shown = useMemo(
    () =>
      (files ?? []).filter((f) => {
        const needle = q.trim().toLowerCase();
        return (
          f.toLowerCase().includes(needle) ||
          (findAttribution(f, rules)?.artist ?? '')
            .toLowerCase()
            .includes(needle)
        );
      }),
    [files, q, rules],
  );

  if (!files) {
    return <p style={{ opacity: 0.7 }}>Loading...</p>;
  }

  if (!files.length) {
    return (
      <p style={{ opacity: 0.7 }}>
        {exists
          ? 'art-assets/ has no images yet.'
          : 'Create an art-assets/ folder in the repo root and drop images in it (png, jpg, webp, gif, svg).'}
      </p>
    );
  }

  return (
    <div>
      <section className="ui-controls" style={{ marginBottom: 12 }}>
        <TextInput
          aria-label="Filter by file name"
          placeholder="Filter by name or artist"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ width: 240 }}
        />
        <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          Size
          <input
            type="range"
            min={80}
            max={400}
            value={size}
            onChange={(e) => setSize(+e.target.value)}
          />
        </label>
        <span style={{ opacity: 0.7 }}>
          {shown.length} of {files.length}
        </span>
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fill, minmax(${size}px, 1fr))`,
          gap: 24,
        }}
      >
        {shown.map((f) => (
          <figure key={f} style={{ margin: 0 }}>
            <button
              onClick={() => setOpen(f)}
              style={{
                all: 'unset',
                cursor: 'zoom-in',
                display: 'block',
                width: '100%',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url(f)}
                alt={f}
                loading="lazy"
                style={{
                  width: '100%',
                  aspectRatio: '1',
                  objectFit: 'contain',
                  background: 'rgba(128,128,128,.15)',
                  borderRadius: 4,
                }}
              />
            </button>
            <figcaption
              style={{
                fontSize: 12,
                opacity: 0.75,
                wordBreak: 'break-word',
                cursor: 'pointer',
              }}
              onClick={(e) => onAssetNameClick(e, f)}
            >
              {copied === f ? 'Copied!' : f}
            </figcaption>
            <Credit file={f} rules={rules} />
          </figure>
        ))}
      </section>

      {open && (
        <div
          onClick={() => setOpen(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,.85)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            cursor: 'zoom-out',
            gap: 8,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url(open)}
            alt={open}
            style={{
              maxWidth: '92vw',
              maxHeight: '88vh',
              objectFit: 'contain',
            }}
          />
          <span style={{ color: '#fff' }}>{open}</span>
          <Credit file={open} rules={rules} color="#fff" />
        </div>
      )}
    </div>
  );
};
