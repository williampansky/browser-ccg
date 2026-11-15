import type { ParsedUrlQuery } from 'querystring';
import { useEffect, useState } from 'react';
import { PLAY_LAYOUT } from '../play-board/layout-css';
import { one, row, wide } from './lab-model';

const note = { display: 'block', color: '#9aa3b8', fontSize: 11 } as const;

/** The board background: pick an image from public/images/backgrounds, where it goes, how it fits, and how dark / blurred it is. All in the URL (`lbg*`). */
export const BackgroundPanel = ({ q: urlQuery, setParams }: { q: ParsedUrlQuery; setParams: (changes: Record<string, string | null>) => void }) => {
  // What the board really uses: /play's saved background (PLAY_LAYOUT) under whatever the URL sets.
  const q = { ...PLAY_LAYOUT, ...urlQuery };
  const [files, setFiles] = useState<string[]>([]);
  useEffect(() => {
    fetch('/api/backgrounds')
      .then((r) => r.json())
      .then(setFiles)
      .catch(() => setFiles([]));
  }, []);
  const num = (key: string, label: string, def: number, min: number, max: number, step: number, hint?: string) => (
    <label style={row}>
      {label} <input type="number" step={step} style={{ width: 66 }} value={one(q[key]) || def} onChange={(e) => setParams({ [key]: e.target.value })} />
      {one(urlQuery[key]) && <a style={{ marginLeft: 6, cursor: 'pointer', color: '#7aa2ff' }} onClick={() => setParams({ [key]: null })}>reset</a>}
      <input type="range" min={min} max={max} step={step} value={one(q[key]) || def} style={wide} onChange={(e) => setParams({ [key]: e.target.value })} />
      {hint && <small style={note}>{hint}</small>}
    </label>
  );
  const tile = one(q.lbgm) === 'tile';
  return (
    <>
      <label style={row}>
        Image{' '}
        <select value={one(q.lbgf) || 'none'} onChange={(e) => setParams({ lbgf: e.target.value })}>
          <option value="none">none</option>
          {files.map((f) => (
            <option key={f} value={f}>{f.replace('/images/backgrounds/', '')}</option>
          ))}
        </select>
      </label>
      <label style={row}>
        Goes on{' '}
        <select value={one(q.lbgt) || 'table'} onChange={(e) => setParams({ lbgt: e.target.value === 'table' ? null : e.target.value })}>
          <option value="table">the play surface</option>
          <option value="page">behind everything</option>
        </select>
      </label>
      <label style={row}>
        Fit{' '}
        <select value={tile ? 'tile' : 'cover'} onChange={(e) => setParams({ lbgm: e.target.value === 'tile' ? 'tile' : null })}>
          <option value="cover">fill (cover)</option>
          <option value="tile">repeat (tile)</option>
        </select>
      </label>
      {tile && num('lbgs', 'Tile size (px)', 600, 100, 1920, 10, 'Width of one repeat.')}
      {num('lbgd', 'Darken', 0, 0, 1, 0.05, '0 = as is, 1 = black. Dims the image so minions stand out.')}
      {num('lbgb', 'Blur (px)', 0, 0, 30, 1)}
      {!tile && num('lbgx', 'Focus X (%)', 50, 0, 100, 1, 'Which part of the image stays in view when it is cropped.')}
      {!tile && num('lbgy', 'Focus Y (%)', 50, 0, 100, 1)}
    </>
  );
};
