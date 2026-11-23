import type { ParsedUrlQuery } from 'querystring';
import { useEffect } from 'react';
import {
  END_KNOBS,
  fireEndConfetti,
  setEndTuning,
  settingsFromQuery,
} from '../play-board/end-celebration';
import { ENERGY_COLOURS } from '../play-board/layout-css';
import type { PanelProps } from './lab-panels';
import { one, row } from './lab-model';

const TUNING_KEYS = [
  'lenon',
  'lenw',
  'lenm',
  'lenp',
  ...END_KNOBS.map((k) => k.key),
];

/**
 * Hands the URL's confetti settings to the board (the page runs it always, like
 * the sound tuning).
 */
export const useEndTuning = (q: ParsedUrlQuery) => {
  const key = TUNING_KEYS.map((k) => one(q[k])).join('|');
  useEffect(() => {
    setEndTuning(settingsFromQuery((k) => one(q[k])));
    return () => setEndTuning(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
};

const btn = (on: boolean) =>
  ({
    marginRight: 4,
    padding: '3px 10px',
    borderRadius: 6,
    border: '1px solid #3a4052',
    cursor: 'pointer',
    color: '#fff',
    background: on ? '#3d5afe' : '#232634',
  }) as const;

/**
 * The end-of-game screen: the dark overlay and banner, and the confetti. Fire
 * it again or show the whole screen with the buttons.
 */
export const EndPanel = ({ q, setParams, sliders }: PanelProps) => {
  return (
    <>
      <small style={{ display: 'block', color: '#9aa3b8', fontSize: 11 }}>
        What shows when a game ends. "Fire confetti" shoots it once with these
        settings; "Show win screen" and "Show loss screen" hold the overlay and
        banner on the board (a win shoots the confetti when you turn it on).
      </small>
      <div style={row}>
        <button
          style={btn(false)}
          onClick={() =>
            fireEndConfetti(
              true,
              settingsFromQuery((k) => one(q[k])),
            )
          }
        >
          Fire confetti
        </button>
        {(
          [
            ['', 'Hide end screen'],
            ['win', 'Show win screen'],
            ['loss', 'Show loss screen'],
          ] as const
        ).map(([v, name]) => (
          <button
            key={v}
            style={btn(
              (one(q.lenpv) === 'loss' ? 'loss' : one(q.lenpv) ? 'win' : '') ===
                v,
            )}
            onClick={() => setParams({ lenpv: v || null })}
          >
            {name}
          </button>
        ))}
      </div>
      <div
        style={{
          margin: '8px 0',
          paddingBottom: 4,
          borderBottom: '1px solid #2a2f3e',
        }}
      >
        <b>Screen</b>{' '}
        <small style={{ color: '#9aa3b8', fontSize: 11 }}>
          (the loss look follows the win look until you change it)
        </small>
        {['lenbc', 'lenlc'].map((k) => (
          <label key={k} style={row}>
            <input
              type="color"
              value={`#${/^[0-9a-f]{6}$/i.test(one(q[k])) ? one(q[k]) : ENERGY_COLOURS[k].fallback}`}
              onChange={(e) => setParams({ [k]: e.target.value.slice(1) })}
            />{' '}
            {ENERGY_COLOURS[k].label}{' '}
            {one(q[k]) && (
              <button
                onClick={() => setParams({ [k]: null })}
                style={{ fontSize: 11 }}
              >
                reset
              </button>
            )}
          </label>
        ))}
        {sliders(['leno', 'lenol', 'lenf', 'lenbs'])}
      </div>
      <div style={{ margin: '8px 0' }}>
        <b>Confetti</b>
        <label style={row}>
          <input
            type="checkbox"
            checked={one(q.lenon) !== '0'}
            onChange={(e) =>
              setParams({ lenon: e.target.checked ? null : '0' })
            }
          />{' '}
          Confetti on
        </label>
        <label style={row}>
          Fires for{' '}
          <select
            value={one(q.lenw) || 'win'}
            onChange={(e) =>
              setParams({
                lenw: e.target.value === 'win' ? null : e.target.value,
              })
            }
          >
            <option value="win">only when you win</option>
            <option value="all">every game end</option>
          </select>
        </label>
        <label style={row}>
          Shape{' '}
          <select
            value={one(q.lenm) || 'burst'}
            onChange={(e) =>
              setParams({
                lenm: e.target.value === 'burst' ? null : e.target.value,
              })
            }
          >
            <option value="burst">one burst</option>
            <option value="sides">two cannons from the sides</option>
          </select>
        </label>
        <label style={row}>
          Colours{' '}
          <select
            value={one(q.lenp) || 'default'}
            onChange={(e) =>
              setParams({
                lenp: e.target.value === 'default' ? null : e.target.value,
              })
            }
          >
            <option value="default">rainbow</option>
            <option value="gold">gold</option>
            <option value="fire">fire</option>
            <option value="ice">ice</option>
          </select>
        </label>
        {sliders(END_KNOBS.map((k) => k.key))}
      </div>
    </>
  );
};
