import type { ParsedUrlQuery } from 'querystring';
import { useEffect, useState } from 'react';
import { PLAY_LAYOUT } from '../play-board/layout-css';
import { NUMS, one, row, wide } from './lab-model';

/**
 * What the board uses when a knob has no override: measured from the DOM, so an
 * untouched slider sits at the real default.
 */
export const useMeasuredDefaults = (query: ParsedUrlQuery) => {
  const [defaults, setDefaults] = useState<Record<string, number>>({});
  useEffect(() => {
    const measure = () =>
      setDefaults((old) => {
        const next = { ...old };
        let changed = false;
        NUMS.forEach((n) => {
          if (one(query[n.key]) !== '') return; // overridden: keep the last default we saw
          const v = n.read();
          if (v !== undefined && next[n.key] !== v) {
            next[n.key] = v;
            changed = true;
          }
        });
        return changed ? next : old;
      });
    measure();
    const t = setInterval(measure, 400); // the board mounts late and resizes with the window
    return () => clearInterval(t);
  }, [query]);
  return defaults;
};

/**
 * The slider rows for these knob keys (a number box, a reset link and a range).
 */
export const LabSliders = ({
  keys,
  q,
  defaults,
  setParams,
}: {
  keys: string[];
  q: ParsedUrlQuery;
  defaults: Record<string, number>;
  setParams: (changes: Record<string, string | null>) => void;
}) => (
  <>
    {NUMS.filter((n) => keys.includes(n.key)).map((n) => {
      const own = one(q[n.key]);
      // With no override the board uses /play's saved value (PLAY_LAYOUT) when
      // there is one, so show that.
      const raw = own || PLAY_LAYOUT[n.key] || '';
      return (
        <label key={n.key} style={row}>
          {n.label}{' '}
          <input
            type="number"
            step={n.step ?? 1}
            value={raw || (defaults[n.key] ?? '')}
            style={{ width: 66 }}
            onChange={(e) => setParams({ [n.key]: e.target.value })}
          />
          {!own && !PLAY_LAYOUT[n.key] && defaults[n.key] !== undefined && (
            <span style={{ color: '#9aa3b8' }}> (default)</span>
          )}
          {own && (
            <a
              style={{ marginLeft: 6, cursor: 'pointer', color: '#7aa2ff' }}
              onClick={() => setParams({ [n.key]: null })}
            >
              reset
            </a>
          )}
          <input
            type="range"
            min={Math.min(n.min, defaults[n.key] ?? n.min)}
            max={Math.max(n.max, defaults[n.key] ?? n.max)}
            step={n.step ?? 1}
            value={raw || (defaults[n.key] ?? n.min)}
            style={wide}
            onChange={(e) => setParams({ [n.key]: e.target.value })}
          />
        </label>
      );
    })}
  </>
);
