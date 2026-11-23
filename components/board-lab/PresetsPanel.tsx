import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { row } from './lab-model';

type Preset = { name: string; qs: string; layoutOnly: boolean };
const PRESET_KEY = 'ccg.boardlab.presets';

/** Saved layouts: a name plus a URL param string (everything, or only the layout params), kept in this browser's localStorage. */
export const PresetsPanel = () => {
  const router = useRouter();
  // Presets: a name plus a saved URL param string (everything, or only the layout params: all of them start with "l").
  // Loading one replaces the URL; the board restarts only if a restart-needing param (heroes, hand) differs.
  const [presets, setPresets] = useState<Preset[]>([]);
  const [presetName, setPresetName] = useState('');
  const [layoutOnly, setLayoutOnly] = useState(false);
  const [prevQs, setPrevQs] = useState<string | null>(null); // the URL before the last load, for the A/B flip
  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(PRESET_KEY) ?? '[]');
      if (Array.isArray(saved))
        setPresets(
          saved.filter(
            (x) => x && typeof x.name === 'string' && typeof x.qs === 'string',
          ),
        );
    } catch {
      /* no saved presets */
    }
  }, []);
  const storePresets = (next: Preset[]) => {
    setPresets(next);
    window.localStorage.setItem(PRESET_KEY, JSON.stringify(next));
  };
  const qsOf = (only: boolean) => {
    const u = new URLSearchParams();
    Object.entries(router.query)
      .filter(([k]) => !only || k.startsWith('l'))
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .forEach(([k, v]) => u.set(k, Array.isArray(v) ? v[0] : (v ?? '')));
    return u.toString();
  };
  const applyQs = (qs: string, only: boolean) => {
    setPrevQs(qsOf(false));
    const next: Record<string, string> = {};
    if (only)
      Object.entries(router.query).forEach(
        ([k, v]) =>
          !k.startsWith('l') && (next[k] = Array.isArray(v) ? v[0] : (v ?? '')),
      );
    new URLSearchParams(qs).forEach((v, k) => (next[k] = v));
    router.replace({ pathname: router.pathname, query: next }, undefined, {
      shallow: true,
    });
  };
  const savePreset = (name: string, only: boolean) => {
    const n = name.trim();
    if (!n) return;
    const entry = { name: n, qs: qsOf(only), layoutOnly: only };
    storePresets(
      presets.some((x) => x.name === n)
        ? presets.map((x) => (x.name === n ? entry : x))
        : [...presets, entry],
    );
    setPresetName('');
  };
  const exportPresets = () =>
    navigator.clipboard?.writeText(JSON.stringify(presets, null, 1));
  const importPresets = () => {
    const text = window.prompt('Paste presets JSON (same names are replaced)');
    if (!text) return;
    try {
      const incoming = JSON.parse(text);
      if (!Array.isArray(incoming)) throw new Error('not a list');
      const ok: Preset[] = incoming
        .filter(
          (x) => x && typeof x.name === 'string' && typeof x.qs === 'string',
        )
        .map((x) => ({ name: x.name, qs: x.qs, layoutOnly: !!x.layoutOnly }));
      storePresets([
        ...presets.filter((x) => !ok.some((y) => y.name === x.name)),
        ...ok,
      ]);
    } catch {
      window.alert('That is not a presets list.');
    }
  };
  return (
    <>
      <div style={row}>
        <input
          placeholder="Preset name"
          value={presetName}
          style={{ width: 130 }}
          onChange={(e) => setPresetName(e.target.value)}
          onKeyDown={(e) =>
            e.key === 'Enter' && savePreset(presetName, layoutOnly)
          }
        />{' '}
        <button
          disabled={!presetName.trim()}
          onClick={() => savePreset(presetName, layoutOnly)}
        >
          Save
        </button>
      </div>
      <label style={row}>
        <input
          type="checkbox"
          checked={layoutOnly}
          onChange={(e) => setLayoutOnly(e.target.checked)}
        />{' '}
        Layout only (keeps whatever board you have)
      </label>
      {presets.length === 0 && (
        <div style={{ color: '#9aa3b8', fontSize: 11 }}>
          None yet. Save the current URL to compare it later.
        </div>
      )}
      {presets.map((pr) => {
        const active = qsOf(pr.layoutOnly) === pr.qs;
        return (
          <div
            key={pr.name}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              margin: '4px 0',
            }}
          >
            <span
              style={{
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontWeight: active ? 700 : 400,
                color: active ? '#8ff0a4' : undefined,
              }}
              title={pr.qs}
            >
              {pr.name}
              {pr.layoutOnly && (
                <span style={{ color: '#9aa3b8', fontSize: 10 }}> layout</span>
              )}
            </span>
            <button onClick={() => applyQs(pr.qs, pr.layoutOnly)}>Load</button>
            <button
              title="Overwrite this preset with the current URL"
              onClick={() => savePreset(pr.name, pr.layoutOnly)}
            >
              Update
            </button>
            <button
              title="Delete"
              onClick={() =>
                storePresets(presets.filter((x) => x.name !== pr.name))
              }
            >
              ✕
            </button>
          </div>
        );
      })}
      <div style={row}>
        <button
          disabled={prevQs === null}
          title="Go back to the URL from before the last Load (press again to come back)"
          onClick={() => prevQs !== null && applyQs(prevQs, false)}
        >
          Flip A/B
        </button>{' '}
        <button onClick={exportPresets}>Export</button>{' '}
        <button onClick={importPresets}>Import</button>
      </div>
    </>
  );
};
