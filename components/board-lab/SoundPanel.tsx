import type { ParsedUrlQuery } from 'querystring';
import { useEffect, useState } from 'react';
import {
  HOVER_GAP_MS,
  previewSound,
  setHoverGapMs,
  stopPreview,
  setSoundTuning,
  soundDefaults,
} from '../play-board/sounds';
import type { TunableSound } from '../play-board/sounds';
import { one, row, wide } from './lab-model';

export const SOUND_SLOTS: [TunableSound, string][] = [
  ['cardPlay', 'Card play'],
  ['draw', 'Card draw'],
  ['cardHover', 'Hand hover'],
  ['hold', 'Held card (loop)'],
];

/**
 * Applies the URL's sound overrides (file `lsf_<slot>`, volume `lsg_<slot>`,
 * pitch variation `lsj_<slot>`, hover gap `lsgap`) to the sound engine.
 * The page runs it always, so a URL's sounds apply whichever tab is showing.
 */
export const useSoundTuning = (q: ParsedUrlQuery) => {
  const soundKey =
    SOUND_SLOTS.map(([n]) =>
      [
        one(q[`lsf_${n}`]),
        one(q[`lsg_${n}`]),
        one(q[`lsj_${n}`]),
        one(q[`lsm_${n}`]),
      ].join('|'),
    ).join(';') + one(q.lsgap);
  useEffect(() => {
    SOUND_SLOTS.forEach(([n]) => {
      const file = one(q[`lsf_${n}`]);
      const gain = one(q[`lsg_${n}`]);
      const jitter = one(q[`lsj_${n}`]);
      const len = one(q[`lsm_${n}`]);
      setSoundTuning(
        n,
        file || gain || jitter || len
          ? {
              file: file || undefined,
              gain: gain ? +gain : undefined,
              jitter: jitter ? +jitter : undefined,
              maxMs: len ? +len : undefined,
            }
          : undefined,
      );
    });
    setHoverGapMs(one(q.lsgap) ? +one(q.lsgap) : undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soundKey]);
};

/** The sound files in public/sounds, fetched once for every panel. */
let soundFilesPromise: Promise<string[]> | undefined;
const useSoundFiles = () => {
  const [soundFiles, setSoundFiles] = useState<string[]>([]);
  useEffect(() => {
    soundFilesPromise =
      soundFilesPromise ??
      fetch('/api/sounds')
        .then((r) => r.json())
        .catch(() => []);
    soundFilesPromise.then(setSoundFiles);
  }, []);
  return soundFiles;
};

type SoundPanelProps = {
  q: ParsedUrlQuery;
  setParams: (changes: Record<string, string | null>) => void;
};

/**
 * The lab's Sounds tab has one accordion section per sound; this is the inside
 * of one: file, volume, pitch variation, length.
 */
export const SoundSlotPanel = ({
  slot: n,
  q,
  setParams,
}: SoundPanelProps & { slot: TunableSound }) => {
  const soundFiles = useSoundFiles();
  const d = soundDefaults(n);
  const file = one(q[`lsf_${n}`]);
  const gain = one(q[`lsg_${n}`]);
  const jitter = one(q[`lsj_${n}`]);
  const len = one(q[`lsm_${n}`]);
  return (
    <div>
      <button onClick={() => previewSound(n)}>Play</button>{' '}
      <button onClick={stopPreview}>Stop</button>
      <label style={row}>
        File{' '}
        <select
          style={{ maxWidth: '100%' }}
          value={file}
          onChange={(e) => setParams({ [`lsf_${n}`]: e.target.value || null })}
        >
          <option value="">
            default (
            {d.files.length > 1
              ? `${d.files.length} variants`
              : d.files[0].split('/').pop()}
            )
          </option>
          {soundFiles.map((f) => (
            <option key={f} value={f}>
              {f.replace('/sounds/', '')}
            </option>
          ))}
        </select>
      </label>
      <label style={row}>
        Volume{' '}
        <input
          type="number"
          step={0.05}
          style={{ width: 60 }}
          value={gain || d.gain}
          onChange={(e) => setParams({ [`lsg_${n}`]: e.target.value })}
        />
        {gain && (
          <a
            style={{ marginLeft: 6, cursor: 'pointer', color: '#7aa2ff' }}
            onClick={() => setParams({ [`lsg_${n}`]: null })}
          >
            reset
          </a>
        )}
        <input
          type="range"
          min={0}
          max={1.5}
          step={0.05}
          value={gain || d.gain}
          style={wide}
          onChange={(e) => setParams({ [`lsg_${n}`]: e.target.value })}
        />
      </label>
      {n !== 'hold' && (
        <label style={row}>
          Pitch variation{' '}
          <input
            type="number"
            step={0.01}
            style={{ width: 60 }}
            value={jitter || d.jitter}
            onChange={(e) => setParams({ [`lsj_${n}`]: e.target.value })}
          />
          {jitter && (
            <a
              style={{ marginLeft: 6, cursor: 'pointer', color: '#7aa2ff' }}
              onClick={() => setParams({ [`lsj_${n}`]: null })}
            >
              reset
            </a>
          )}
          <input
            type="range"
            min={0}
            max={0.4}
            step={0.01}
            value={jitter || d.jitter}
            style={wide}
            onChange={(e) => setParams({ [`lsj_${n}`]: e.target.value })}
          />
          <small style={{ display: 'block', color: '#9aa3b8', fontSize: 11 }}>
            How much each play is randomly sped up or slowed down (0.1 = up to
            10% either way), so repeats do not sound identical.
          </small>
        </label>
      )}
      {n !== 'hold' && (
        <label style={row}>
          Length (ms){' '}
          <input
            type="number"
            step={10}
            style={{ width: 60 }}
            value={len || d.maxMs || 0}
            onChange={(e) => setParams({ [`lsm_${n}`]: e.target.value })}
          />
          {len && (
            <a
              style={{ marginLeft: 6, cursor: 'pointer', color: '#7aa2ff' }}
              onClick={() => setParams({ [`lsm_${n}`]: null })}
            >
              reset
            </a>
          )}
          <input
            type="range"
            min={0}
            max={1000}
            step={10}
            value={len || d.maxMs || 0}
            style={wide}
            onChange={(e) => setParams({ [`lsm_${n}`]: e.target.value })}
          />
          <small style={{ display: 'block', color: '#9aa3b8', fontSize: 11 }}>
            Cuts the sound short after this long (with a quick fade). Short
            flicks stack into a ruffle when you fan across cards; 0 plays the
            whole sound.
          </small>
        </label>
      )}
    </div>
  );
};

/** The shortest time between two hand-hover sounds. */
export const HoverGapPanel = ({ q, setParams }: SoundPanelProps) => (
  <>
    <label style={row}>
      Hover gap (ms){' '}
      <input
        type="number"
        step={5}
        style={{ width: 60 }}
        value={one(q.lsgap) || HOVER_GAP_MS}
        onChange={(e) => setParams({ lsgap: e.target.value })}
      />
      {one(q.lsgap) && (
        <a
          style={{ marginLeft: 6, cursor: 'pointer', color: '#7aa2ff' }}
          onClick={() => setParams({ lsgap: null })}
        >
          reset
        </a>
      )}
      <input
        type="range"
        min={0}
        max={300}
        step={5}
        value={one(q.lsgap) || HOVER_GAP_MS}
        style={wide}
        onChange={(e) => setParams({ lsgap: e.target.value })}
      />
      <small style={{ display: 'block', color: '#9aa3b8', fontSize: 11 }}>
        Shortest time between two hand-hover sounds. Higher means fewer ticks
        when you sweep across your hand; 0 plays one on every card.
      </small>
    </label>
  </>
);
