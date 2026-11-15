import type { ParsedUrlQuery } from 'querystring';
import { useEffect, useState } from 'react';
import { previewSound, setHoverGapMs, setSoundTuning, soundDefaults } from '../play-board/sounds';
import type { TunableSound } from '../play-board/sounds';
import { one, row, wide } from './lab-model';

/** The lab's sound controls: pick a file, volume, pitch variation and hover gap per sound; values live in the URL and go straight to the sound engine. */
export const SoundPanel = ({ q, setParams }: { q: ParsedUrlQuery; setParams: (changes: Record<string, string | null>) => void }) => {
  // Sounds: the lab's overrides (file `lsf_<slot>`, volume `lsg_<slot>`, pitch variation `lsj_<slot>`, hover gap `lsgap`) go straight to the sound engine.
  const SOUND_SLOTS: [TunableSound, string][] = [
    ['cardPlay', 'Card play'],
    ['draw', 'Card draw'],
    ['cardHover', 'Hand hover'],
    ['hold', 'Held card (loop)'],
  ];
  const [soundFiles, setSoundFiles] = useState<string[]>([]);
  useEffect(() => {
    fetch('/api/sounds')
      .then((r) => r.json())
      .then(setSoundFiles)
      .catch(() => setSoundFiles([]));
  }, []);
  const soundKey = SOUND_SLOTS.map(([n]) => [one(q[`lsf_${n}`]), one(q[`lsg_${n}`]), one(q[`lsj_${n}`])].join('|')).join(';') + one(q.lsgap);
  useEffect(() => {
    SOUND_SLOTS.forEach(([n]) => {
      const file = one(q[`lsf_${n}`]);
      const gain = one(q[`lsg_${n}`]);
      const jitter = one(q[`lsj_${n}`]);
      setSoundTuning(n, file || gain || jitter ? { file: file || undefined, gain: gain ? +gain : undefined, jitter: jitter ? +jitter : undefined } : undefined);
    });
    setHoverGapMs(one(q.lsgap) ? +one(q.lsgap) : undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soundKey]);
  return (
    <>
    {SOUND_SLOTS.map(([n, label]) => {
      const d = soundDefaults(n);
      const file = one(q[`lsf_${n}`]);
      const gain = one(q[`lsg_${n}`]);
      const jitter = one(q[`lsj_${n}`]);
      return (
        <div key={n} style={{ margin: '8px 0', paddingBottom: 6, borderBottom: '1px solid #2a2f3e' }}>
          <b>{label}</b>{' '}
          <button onClick={() => previewSound(n)}>Play</button>
          <label style={row}>
            File{' '}
            <select style={{ maxWidth: '100%' }} value={file} onChange={(e) => setParams({ [`lsf_${n}`]: e.target.value || null })}>
              <option value="">default ({d.files.length > 1 ? `${d.files.length} variants` : d.files[0].split('/').pop()})</option>
              {soundFiles.map((f) => (
                <option key={f} value={f}>{f.replace('/sounds/', '')}</option>
              ))}
            </select>
          </label>
          <label style={row}>
            Volume <input type="number" step={0.05} style={{ width: 60 }} value={gain || d.gain} onChange={(e) => setParams({ [`lsg_${n}`]: e.target.value })} />
            {gain && <a style={{ marginLeft: 6, cursor: 'pointer', color: '#7aa2ff' }} onClick={() => setParams({ [`lsg_${n}`]: null })}>reset</a>}
            <input type="range" min={0} max={1.5} step={0.05} value={gain || d.gain} style={wide} onChange={(e) => setParams({ [`lsg_${n}`]: e.target.value })} />
          </label>
          {n !== 'hold' && (
            <label style={row}>
              Pitch variation <input type="number" step={0.01} style={{ width: 60 }} value={jitter || d.jitter} onChange={(e) => setParams({ [`lsj_${n}`]: e.target.value })} />
              {jitter && <a style={{ marginLeft: 6, cursor: 'pointer', color: '#7aa2ff' }} onClick={() => setParams({ [`lsj_${n}`]: null })}>reset</a>}
              <input type="range" min={0} max={0.4} step={0.01} value={jitter || d.jitter} style={wide} onChange={(e) => setParams({ [`lsj_${n}`]: e.target.value })} />
            </label>
          )}
        </div>
      );
    })}
    <label style={row}>
      Hover gap (ms) <input type="number" step={5} style={{ width: 60 }} value={one(q.lsgap) || 55} onChange={(e) => setParams({ lsgap: e.target.value })} />
      {one(q.lsgap) && <a style={{ marginLeft: 6, cursor: 'pointer', color: '#7aa2ff' }} onClick={() => setParams({ lsgap: null })}>reset</a>}
      <input type="range" min={0} max={300} step={5} value={one(q.lsgap) || 55} style={wide} onChange={(e) => setParams({ lsgap: e.target.value })} />
    </label>
    </>
  );
};
