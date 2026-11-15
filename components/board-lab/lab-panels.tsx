import type { ParsedUrlQuery } from 'querystring';
import type { ReactNode } from 'react';
import { HEROES, SLIDER_MAX, one, row, wide } from './lab-model';

export interface PanelProps {
  q: ParsedUrlQuery;
  setParams: (changes: Record<string, string | null>) => void;
  /** The slider rows for these knob keys */
  sliders: (keys: string[]) => ReactNode;
  /** How many ids a comma-separated param holds */
  count: (key: string) => number;
  /** A starter list of minion ids: n of them, from an offset */
  pick: (n: number, offset: number) => string;
}


export const BoardPanel = ({ q, setParams, sliders, count, pick }: PanelProps) => (
  <>
    <label style={row}>
      My minions: <b>{count('b0')}</b>
      <input type="range" min={0} max={SLIDER_MAX.minions} value={count('b0')} style={wide}
        onChange={(e) => setParams({ b0: +e.target.value ? pick(+e.target.value, 1) : null })} />
    </label>
    <label style={row}>
      Their minions: <b>{count('b1')}</b>
      <input type="range" min={0} max={SLIDER_MAX.minions} value={count('b1')} style={wide}
        onChange={(e) => setParams({ b1: +e.target.value ? pick(+e.target.value, 2) : null })} />
    </label>
    <div style={row}>
      Turn{' '}
      {([['0', 'Player'], ['1', 'Enemy']] as const).map(([v, name]) => (
        <button
          key={v}
          onClick={() => setParams({ turn: v })}
          style={{ marginRight: 4, padding: '3px 10px', borderRadius: 6, border: '1px solid #3a4052', cursor: 'pointer', color: '#fff', background: one(q.turn) === v ? '#3d5afe' : '#232634' }}
        >
          {name}
        </button>
      ))}
    </div>
    <label style={row}>
      Energy (mine) <input type="number" min={0} max={SLIDER_MAX.energy} style={{ width: 50 }} value={one(q.e0)} onChange={(e) => setParams({ e0: e.target.value })} />
    </label>
  </>
);

export const RestartPanel = ({ q, setParams, sliders, count, pick }: PanelProps) => (
  <>
    {(['h0', 'h1'] as const).map((k) => (
      <label key={k} style={row}>
        {k === 'h0' ? 'My hero' : 'Their hero'}{' '}
        <select value={one(q[k])} onChange={(e) => setParams({ [k]: e.target.value })}>
          {HEROES.map((h) => <option key={h} value={h}>{h || 'default'}</option>)}
        </select>
      </label>
    ))}
    <label style={row}>
      <input type="checkbox" checked={'herofig' in q} onChange={(e) => setParams({ herofig: e.target.checked ? '1' : null })} /> Hero figure UI
    </label>
    <label style={row}>
      My hand ids <input style={{ width: '100%' }} placeholder="CORE_045,CORE_051" value={one(q.p0)} onChange={(e) => setParams({ p0: e.target.value })} />
    </label>
  </>
);

export const MinionsPanel = ({ q, setParams, sliders, count, pick }: PanelProps) => (
  <>
    {sliders(['lm', 'lg', 'lml', 'lms', 'lmh'])}
    <div style={{ margin: '8px 0 2px', borderTop: '1px solid #2a2f3e', paddingTop: 6 }}>
      <b>Portrait inside the frame</b>
      <small style={{ display: 'block', color: '#9aa3b8', fontSize: 11 }}>
        The picture scales inside the oval (the frame stays put) when you hover a minion, and when one is selected. 1 = off. Needs no click: hover a minion on the board.
      </small>
      {sliders(['lpsh', 'lpss', 'lpsm', 'lpsy'])}
    </div>
    <label style={row}>
      <input type="checkbox" checked={'lmpv' in q} onChange={(e) => setParams({ lmpv: e.target.checked ? '1' : null })} /> Preview clicked minion (my first)
    </label>
  </>
);

export const TablePanel = ({ q, setParams, sliders, count, pick }: PanelProps) => (
  <>
    {sliders(['ls', 'lw'])}
    <label style={row}>
      <input type="checkbox" checked={one(q.lfelt) !== '0'} onChange={(e) => setParams({ lfelt: e.target.checked ? null : '0' })} /> Felt panel
    </label>
  </>
);

export const HandsPanel = ({ q, setParams, sliders, count, pick }: PanelProps) => (
  <>
    {sliders(['lhw0', 'lhw1', 'lhs', 'lsel'])}
    <label style={row}>
      <input type="checkbox" checked={'lpv' in q} onChange={(e) => setParams({ lpv: e.target.checked ? '1' : null })} /> Preview clicked card (first card)
    </label>
  </>
);

export const EnergyPanel = ({ q, setParams, sliders, count, pick }: PanelProps) => (
  <>
    <div style={row}>
      Orientation{' '}
      {([['v', 'Vertical'], ['h', 'Horizontal']] as const).map(([v, name]) => (
        <button
          key={v}
          onClick={() => setParams({ leo: v === 'v' ? null : v })}
          style={{ marginRight: 4, padding: '3px 10px', borderRadius: 6, border: '1px solid #3a4052', cursor: 'pointer', color: '#fff', background: (one(q.leo) === 'h') === (v === 'h') ? '#3d5afe' : '#232634' }}
        >
          {name}
        </button>
      ))}
    </div>
    {sliders(['les', 'lex', 'ley'])}
  </>
);

export const LogDeckPanel = ({ q, setParams, sliders, count, pick }: PanelProps) => (
  <>
    <label style={row}>
      Arrangement{' '}
      <select value={one(q.lpan) || 'default'} onChange={(e) => setParams({ lpan: e.target.value === 'default' ? null : e.target.value })}>
        <option value="default">Log left, deck right</option>
        <option value="swap">Deck left, log right</option>
        <option value="stackL">Stacked on the left</option>
        <option value="stackR">Stacked on the right</option>
      </select>
    </label>
    {sliders(['lsplit', 'lgw', 'ldw', 'lgx', 'lgy', 'ldx', 'ldy'])}
  </>
);

export const HeroFiguresPanel = ({ q, setParams, sliders, count, pick }: PanelProps) => (
  <>
    {sliders(['lfw0', 'lfw1', 'lfx0', 'lfy0', 'lfx1', 'lfy1'])}
    <label style={row}>
      Figure side{' '}
      <select value={one(q.lfs) || 'left'} onChange={(e) => setParams({ lfs: e.target.value === 'left' ? null : e.target.value })}>
        <option value="left">left</option>
        <option value="right">right</option>
      </select>
    </label>
  </>
);

const SHADOW_STATES: [string, string][] = [
  ['def', 'Default'],
  ['rdy', 'Ready to attack'],
  ['sel', 'Selected / lifted'],
  ['aim', 'Can be aimed at'],
  ['hov', 'Aimed at (hovered)'],
];
/** The dark drop shadow under a board minion, for each state. */
export const ShadowsPanel = ({ sliders }: PanelProps) => (
  <>
    <small style={{ display: 'block', color: '#9aa3b8', fontSize: 11 }}>
      The dark shadow under a minion's oval, per state. Darkness 0 = none. Selected, aimed and hovered start at 0 (no shadow), as before. Select a minion
      (or use the Minions preview) to see its lifted shadow.
    </small>
    {SHADOW_STATES.map(([s, label]) => (
      <div key={s} style={{ margin: '6px 0', paddingBottom: 4, borderBottom: '1px solid #2a2f3e' }}>
        <b>{label}</b>
        {sliders([`lsh${s}y`, `lsh${s}b`, `lsh${s}a`])}
      </div>
    ))}
  </>
);
