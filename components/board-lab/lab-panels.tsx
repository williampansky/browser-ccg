import { LOG_SAMPLES } from '../play-board/sample-log';
import type { ParsedUrlQuery } from 'querystring';
import type { ReactNode } from 'react';
import { ENERGY_COLOURS, MID_KNOBS } from '../play-board/layout-css';
import { labLayout } from './lab-tier';
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

/** The Flow card the preview puts in your hand */
const FLOW_PREVIEW_CARD = 'PRIME_189';

/** Your hand ids with the Flow preview card in front, unless already there. */
const withFlowCard = (hand: string): string => {
  const ids = hand ? hand.split(',') : [];
  return ids.includes(FLOW_PREVIEW_CARD)
    ? hand
    : [FLOW_PREVIEW_CARD, ...ids].join(',');
};

export const BoardPanel = ({
  q,
  setParams,
  sliders,
  count,
  pick,
}: PanelProps) => (
  <>
    <label style={row}>
      My minions: <b>{count('b0')}</b>
      <input
        type="range"
        min={0}
        max={SLIDER_MAX.minions}
        value={count('b0')}
        style={wide}
        onChange={(e) =>
          setParams({ b0: +e.target.value ? pick(+e.target.value, 1) : null })
        }
      />
    </label>
    <label style={row}>
      Their minions: <b>{count('b1')}</b>
      <input
        type="range"
        min={0}
        max={SLIDER_MAX.minions}
        value={count('b1')}
        style={wide}
        onChange={(e) =>
          setParams({ b1: +e.target.value ? pick(+e.target.value, 2) : null })
        }
      />
    </label>
    <div style={row}>
      Turn{' '}
      {(
        [
          ['0', 'Player'],
          ['1', 'Enemy'],
        ] as const
      ).map(([v, name]) => (
        <button
          key={v}
          onClick={() => setParams({ turn: v })}
          style={{
            marginRight: 4,
            padding: '3px 10px',
            borderRadius: 6,
            border: '1px solid #3a4052',
            cursor: 'pointer',
            color: '#fff',
            background: one(q.turn) === v ? '#3d5afe' : '#232634',
          }}
        >
          {name}
        </button>
      ))}
    </div>
    <label style={row}>
      Energy (mine){' '}
      <input
        type="number"
        min={0}
        max={SLIDER_MAX.energy}
        style={{ width: 50 }}
        value={one(q.e0)}
        onChange={(e) => setParams({ e0: e.target.value })}
      />
    </label>
  </>
);

export const RestartPanel = ({
  q,
  setParams,
  sliders,
  count,
  pick,
}: PanelProps) => (
  <>
    {(['h0', 'h1'] as const).map((k) => (
      <label key={k} style={row}>
        {k === 'h0' ? 'My hero' : 'Their hero'}{' '}
        <select
          value={one(q[k])}
          onChange={(e) => setParams({ [k]: e.target.value })}
        >
          {HEROES.map((h) => (
            <option key={h} value={h}>
              {h || 'default'}
            </option>
          ))}
        </select>
      </label>
    ))}
    <label style={row}>
      <input
        type="checkbox"
        checked={'herofig' in q}
        onChange={(e) => setParams({ herofig: e.target.checked ? '1' : null })}
      />{' '}
      Hero figure UI
    </label>
    {(['hn0', 'hn1'] as const).map((k) => (
      <label key={k} style={row}>
        {k === 'hn0' ? 'Cards in my hand' : 'Cards in their hand'}{' '}
        <input
          type="number"
          min={0}
          max={10}
          placeholder="default"
          style={{ width: 70 }}
          value={one(q[k])}
          onChange={(e) => setParams({ [k]: e.target.value })}
        />
      </label>
    ))}
    <label style={row}>
      My hand ids{' '}
      <input
        style={{ width: '100%' }}
        placeholder="CORE_045,CORE_051"
        value={one(q.p0)}
        onChange={(e) => setParams({ p0: e.target.value })}
      />
    </label>
  </>
);

export const MinionsPanel = ({
  q,
  setParams,
  sliders,
  count,
  pick,
}: PanelProps) => (
  <>
    {sliders(['lm', 'lg', 'lml', 'lms', 'lmh'])}
    <div
      style={{
        margin: '8px 0 2px',
        borderTop: '1px solid #2a2f3e',
        paddingTop: 6,
      }}
    >
      <b>Portrait inside the frame</b>
      <small style={{ display: 'block', color: '#9aa3b8', fontSize: 11 }}>
        The picture scales inside the oval (the frame stays put) when you hover
        a minion, and when one is selected. 1 = off. Needs no click: hover a
        minion on the board.
      </small>
      {sliders(['lpsh', 'lpss', 'lpsm', 'lpsy'])}
    </div>
    <label style={row}>
      <input
        type="checkbox"
        checked={'lmpv' in q}
        onChange={(e) => setParams({ lmpv: e.target.checked ? '1' : null })}
      />{' '}
      Preview clicked minion (my first)
    </label>
  </>
);

export const TablePanel = ({
  q,
  setParams,
  sliders,
  count,
  pick,
}: PanelProps) => (
  <>
    {sliders(['ls', 'lw', 'lbx'])}
    <label style={row}>
      <input
        type="checkbox"
        checked={one(q.lfelt) !== '0'}
        onChange={(e) => setParams({ lfelt: e.target.checked ? null : '0' })}
      />{' '}
      Felt panel
    </label>
  </>
);

export const HandsPanel = ({
  q,
  setParams,
  sliders,
  count,
  pick,
}: PanelProps) => (
  <>
    {sliders(['lhw0', 'lhw1', 'lhs'])}
    <div style={groupStyle}>
      <b>Fan</b>
    </div>
    {sliders(['lhrt', 'lhdp', 'lhdc', 'lhol'])}
    <div style={groupStyle}>
      <b>Fan tilt, drop and spacing by number of cards</b> (each one replaces
      the main value while the hand holds exactly that many)
    </div>
    <label style={row}>
      Cards in my hand now{' '}
      <input
        type="number"
        min={0}
        max={10}
        placeholder="default"
        style={{ width: 70 }}
        value={one(q.hn0)}
        onChange={(e) => setParams({ hn0: e.target.value })}
      />{' '}
      (restarts the board; plays and draws change it live)
    </label>
    {sliders([
      'lhrt1',
      'lhrt2',
      'lhrt3',
      'lhrt4',
      'lhrt5',
      'lhrt6',
      'lhrt7',
      'lhrt8',
      'lhrt9',
      'lhrt10',
    ])}
    {sliders([
      'lhdp1',
      'lhdp2',
      'lhdp3',
      'lhdp4',
      'lhdp5',
      'lhdp6',
      'lhdp7',
      'lhdp8',
      'lhdp9',
      'lhdp10',
    ])}
    {sliders([
      'lhol1',
      'lhol2',
      'lhol3',
      'lhol4',
      'lhol5',
      'lhol6',
      'lhol7',
      'lhol8',
      'lhol9',
      'lhol10',
    ])}
    <div style={groupStyle}>
      <b>Hover</b> (the card under the pointer)
    </div>
    <label style={row}>
      Hold card number{' '}
      <input
        type="number"
        min={0}
        max={10}
        style={{ width: 50 }}
        value={one(q.lhpv)}
        onChange={(e) =>
          setParams({
            lhpv:
              e.target.value === '' || e.target.value === '0'
                ? null
                : e.target.value,
          })
        }
      />{' '}
      in its hover look (0 = off)
    </label>
    {sliders(['lhsw', 'lhsh', 'lhse', 'lhsx', 'lhsd'])}
    <label style={row}>
      <input
        type="checkbox"
        checked={'lhspv' in q}
        onChange={(e) => setParams({ lhspv: e.target.checked ? '1' : null })}
      />{' '}
      Show the hover slots (red)
    </label>
    {sliders([
      'lhov',
      'lhoy',
      'lhot',
      'lhom',
      'lhpa',
      'lhpb',
      'lhpm',
      'lhha',
      'lhhs',
      'lhfl',
      'lhsm',
    ])}
    <div style={groupStyle}>
      <b>Clicked card, settling and drawing</b>
    </div>
    {sliders(['lsel', 'lselx', 'lsely', 'lhst', 'lhdr'])}
    <label style={row}>
      <input
        type="checkbox"
        checked={'lpv' in q}
        onChange={(e) => setParams({ lpv: e.target.checked ? '1' : null })}
      />{' '}
      Preview clicked card (first card)
    </label>
    <div style={groupStyle}>
      <b>Flow glow (a satisfied Combo)</b>
    </div>
    {sliders(['lxgh', 'lxgb', 'lxga', 'lxgo', 'lxgd', 'lxgk', 'lxgg'])}
    <label style={row}>
      <input
        type="checkbox"
        checked={'lxgpv' in q}
        onChange={(e) =>
          setParams(
            e.target.checked
              ? {
                  lxgpv: '1',
                  p0: withFlowCard(one(q.p0)),
                  ...(one(q.e0) ? {} : { e0: '10' }),
                }
              : { lxgpv: null },
          )
        }
      />{' '}
      Preview: treat Combo as on (adds a Flow card to your hand)
    </label>
  </>
);

const colourPick = (
  q: PanelProps['q'],
  setParams: PanelProps['setParams'],
  key: string,
) => {
  const c = ENERGY_COLOURS[key];
  return (
    <label key={key} style={row}>
      <input
        type="color"
        value={`#${/^[0-9a-f]{6}$/i.test(one(q[key])) ? one(q[key]) : c.fallback}`}
        onChange={(e) => setParams({ [key]: e.target.value.slice(1) })}
      />{' '}
      {c.label}{' '}
      {one(q[key]) && (
        <button
          onClick={() => setParams({ [key]: null })}
          style={{ fontSize: 11 }}
        >
          reset
        </button>
      )}
    </label>
  );
};
const groupStyle = {
  margin: '8px 0',
  paddingBottom: 4,
  borderBottom: '1px solid #2a2f3e',
} as const;

export const PlayOverlayPanel = ({ q, setParams, sliders }: PanelProps) => (
  <>
    <small style={{ display: 'block', color: '#9aa3b8', fontSize: 11 }}>
      The green that shows where a card from your hand can go. Three overlays:
      the global cast area (spells), the minion zone (your board row) and the
      landing gap (the in-between space a minion opens up). The example buttons
      show them without picking a card; the minion examples need a minion on the
      board (My minions, in Setup). A colour or fill left alone follows the "All
      three" settings.
    </small>
    <div style={row}>
      Example{' '}
      {(
        [
          ['', 'Off'],
          ['minion', 'Minion zone + gap'],
          ['minion-hot', 'Minion (hovered)'],
          ['spell', 'Global'],
          ['spell-hot', 'Global (hovered)'],
        ] as const
      ).map(([v, name]) => (
        <button
          key={v}
          onClick={() => setParams({ lpopv: v || null })}
          style={{
            marginRight: 4,
            marginBottom: 4,
            padding: '3px 10px',
            borderRadius: 6,
            border: '1px solid #3a4052',
            cursor: 'pointer',
            color: '#fff',
            background: one(q.lpopv) === v ? '#3d5afe' : '#232634',
          }}
        >
          {name}
        </button>
      ))}
    </div>
    <div style={groupStyle}>
      <b>All three</b>
      {colourPick(q, setParams, 'lpoc')}
      {sliders(['lpoo', 'lpow', 'lpor', 'lpoi', 'lpoh', 'lpos', 'lpoga'])}
    </div>
    <div style={groupStyle}>
      <b>Global / spell area</b>
      {colourPick(q, setParams, 'lpoac')}
      {colourPick(q, setParams, 'lpoahc')}
      {sliders(['lpoao', 'lpoai', 'lpoah', 'lpoahw', 'lpoahg', 'lpoat'])}
    </div>
    <div style={groupStyle}>
      <b>Minion zone</b>
      {colourPick(q, setParams, 'lpozc')}
      {colourPick(q, setParams, 'lpozhc')}
      {sliders(['lpozo', 'lpozi', 'lpozh', 'lpozhw', 'lpozhg', 'lpozt'])}
    </div>
    <div style={groupStyle}>
      <b>Landing gap (the in-between)</b>
      {colourPick(q, setParams, 'lpogc')}
      {sliders(['lpogo', 'lpog', 'lpogw', 'lpogb'])}
      <label style={row}>
        Opening easing{' '}
        <select
          value={one(q.lpoge) || 'out'}
          onChange={(e) =>
            setParams({
              lpoge: e.target.value === 'out' ? null : e.target.value,
            })
          }
        >
          <option value="out">ease out (default)</option>
          <option value="inout">ease in-out</option>
          <option value="linear">linear</option>
          <option value="spring">springy overshoot</option>
          <option value="snap">stepped</option>
        </select>
      </label>
      {sliders(['lpogd', 'lpogs', 'lpogp', 'lpogq'])}
    </div>
  </>
);

export const CastPanel = ({ q, setParams, sliders }: PanelProps) => (
  <>
    <small style={{ display: 'block', color: '#9aa3b8', fontSize: 11 }}>
      The card that flashes in the middle when a spell or item is played. Turn
      the preview on to replay it every 3 seconds while you tune.
    </small>
    {sliders(['lcx', 'lcy', 'lcs', 'lcms', 'lcpeak', 'lcglow', 'lcring'])}
    <div style={row}>
      Preview{' '}
      {(
        [
          ['', 'Off'],
          ['0', 'My cast'],
          ['1', 'Enemy cast'],
        ] as const
      ).map(([v, name]) => (
        <button
          key={v}
          onClick={() => setParams({ lcpv: v || null })}
          style={{
            marginRight: 4,
            padding: '3px 10px',
            borderRadius: 6,
            border: '1px solid #3a4052',
            cursor: 'pointer',
            color: '#fff',
            background: one(q.lcpv) === v ? '#3d5afe' : '#232634',
          }}
        >
          {name}
        </button>
      ))}
    </div>
  </>
);

export const ChoosePanel = ({ q, setParams, sliders }: PanelProps) => (
  <>
    <small style={{ display: 'block', color: '#9aa3b8', fontSize: 11 }}>
      The dialog for "choose one" cards, Surveying Drone and the Cleric&apos;s
      Resurrect: each option is the real card (a blank steel card when it has
      none). Turn the preview on to hold it open with a sample card while you
      tune.
    </small>
    {sliders([
      'lcmw',
      'lcmg',
      'lcmd',
      'lcmt',
      'lcmhs',
      'lcmhl',
      'lcmglow',
      'lcmc',
    ])}
    <div style={row}>
      Preview{' '}
      {(
        [
          ['', 'Off'],
          ['1', 'Hold it open'],
        ] as const
      ).map(([v, name]) => (
        <button
          key={v}
          onClick={() => setParams({ lcmpv: v || null })}
          style={{
            marginRight: 4,
            padding: '3px 10px',
            borderRadius: 6,
            border: '1px solid #3a4052',
            cursor: 'pointer',
            color: '#fff',
            background: one(q.lcmpv) === v ? '#3d5afe' : '#232634',
          }}
        >
          {name}
        </button>
      ))}
    </div>
  </>
);

export const EnergyPanel = ({
  q,
  setParams,
  sliders,
  count,
  pick,
}: PanelProps) => (
  <>
    <div style={row}>
      Orientation{' '}
      {(
        [
          ['v', 'Vertical'],
          ['h', 'Horizontal'],
        ] as const
      ).map(([v, name]) => (
        <button
          key={v}
          onClick={() => setParams({ leo: v === 'v' ? null : v })}
          style={{
            marginRight: 4,
            padding: '3px 10px',
            borderRadius: 6,
            border: '1px solid #3a4052',
            cursor: 'pointer',
            color: '#fff',
            background:
              (one(q.leo) === 'h') === (v === 'h') ? '#3d5afe' : '#232634',
          }}
        >
          {name}
        </button>
      ))}
    </div>
    {sliders(['les', 'lex', 'ley'])}
    <b style={{ display: 'block', marginTop: 8 }}>Colours</b>
    {Object.entries(ENERGY_COLOURS)
      .filter(([, c]) => c.target !== 'page')
      .map(([k, c]) => (
        <label key={k} style={row}>
          <input
            type="color"
            value={`#${/^[0-9a-f]{6}$/i.test(one(q[k])) ? one(q[k]) : c.fallback}`}
            onChange={(e) => setParams({ [k]: e.target.value.slice(1) })}
          />{' '}
          {c.label}{' '}
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
    <b style={{ display: 'block', marginTop: 8 }}>Glow and number</b>
    {sliders(['leg', 'legt', 'lecs', 'lecv', 'lect'])}
    <b style={{ display: 'block', marginTop: 8 }}>
      Blink (orbs a picked card would spend)
    </b>
    {sliders(['lebr', 'lebb', 'lebg'])}
    <div style={row}>
      Preview blink{' '}
      {(
        [
          ['', 'Off'],
          ['spend', 'Spend'],
          ['red', 'Cannot afford'],
        ] as const
      ).map(([v, name]) => (
        <button
          key={v}
          onClick={() => setParams({ lebpv: v || null })}
          style={{
            marginRight: 4,
            padding: '3px 10px',
            borderRadius: 6,
            border: '1px solid #3a4052',
            cursor: 'pointer',
            color: '#fff',
            background: one(q.lebpv) === v ? '#3d5afe' : '#232634',
          }}
        >
          {name}
        </button>
      ))}
    </div>
  </>
);

export const LogDeckPanel = ({
  q,
  setParams,
  sliders,
  count,
  pick,
}: PanelProps) => (
  <>
    <label style={row}>
      Arrangement{' '}
      {/* "default" is written into the URL (not removed from it): with no lpan the lab falls back to the saved layout's arrangement. */}
      <select
        value={one(q.lpan) || labLayout().lpan || 'default'}
        onChange={(e) => setParams({ lpan: e.target.value })}
      >
        <option value="default">Log left, deck right</option>
        <option value="swap">Deck left, log right</option>
        <option value="stackL">Stacked on the left</option>
        <option value="stackR">Stacked on the right</option>
        <option value="joinL">
          Connected sidebar on the left (drag the bar)
        </option>
        <option value="joinR">
          Connected sidebar on the right (drag the bar)
        </option>
      </select>
    </label>
    <small style={{ display: 'block', color: '#9aa3b8', fontSize: 11 }}>
      Connected: the log and deck share one column with a drag bar between them
      (double-click it to reset). The split you drag is remembered in this
      browser (until a player drags it, the log takes the saved starting share,
      30%). One width, one height and one offset set the whole column (the "Log
      X / Y offset" sliders).
    </small>
    {/* Connected: one width for the whole column; separate: a width for each panel. */}
    {['joinL', 'joinR'].includes(one(q.lpan) || labLayout().lpan || '')
      ? sliders(['lsbw', 'lsbh', 'lsbd', 'lgx', 'lgy'])
      : sliders(['lsplit', 'lgw', 'ldw', 'lgx', 'lgy', 'ldx', 'ldy'])}
  </>
);

export const LogTextPanel = ({ q, setParams, sliders }: PanelProps) => (
  <>
    {sliders(['lgfs', 'lglh', 'lgft', 'lgpd', 'lgrd'])}
    {['lgbg', 'lgfg'].map((key) => colourPick(q, setParams, key))}
  </>
);

export const LogBlocksPanel = ({ q, setParams, sliders }: PanelProps) => (
  <>
    <small style={{ display: 'block', color: '#9aa3b8', fontSize: 11 }}>
      One block per action: a stripe in the acting side&apos;s colour, an icon,
      and the action&apos;s words. Cards are coloured by whose they are.
    </small>
    {sliders(['lgsw', 'lgbr', 'lgbp', 'lgis', 'lgico', 'lgcw'])}
    {['lgbb', 'lgcc'].map((key) => colourPick(q, setParams, key))}
  </>
);

export const LogChipsPanel = ({ q, setParams, sliders }: PanelProps) => (
  <>
    <small style={{ display: 'block', color: '#9aa3b8', fontSize: 11 }}>
      The results under an action: a coloured chip (the number or symbol), the
      target and a dim note.
    </small>
    {sliders(['lgsi', 'lgcm', 'lgcr', 'lgnt'])}
    {['lgcd', 'lgch', 'lgca', 'lgcx', 'lgcb', 'lgcu', 'lgsc', 'lgnc'].map(
      (key) => colourPick(q, setParams, key),
    )}
  </>
);

export const LogBreaksPanel = ({ q, setParams, sliders }: PanelProps) => (
  <>
    {sliders(['lggp', 'lgtg', 'lgbw', 'lgts', 'lgtw', 'lgtu'])}
    <label style={row}>
      Break line style{' '}
      <select
        value={one(q.lgbs) || labLayout().lgbs || 'solid'}
        onChange={(e) => setParams({ lgbs: e.target.value })}
      >
        <option value="solid">solid</option>
        <option value="dashed">dashed</option>
        <option value="dotted">dotted</option>
        <option value="double">double</option>
      </select>
    </label>
    {['lgbc', 'lgtc', 'lgtbg'].map((key) => colourPick(q, setParams, key))}
  </>
);

export const LogTestPanel = ({ q, setParams }: PanelProps) => (
  <>
    <div style={row}>
      Load{' '}
      {LOG_SAMPLES.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => setParams({ llpv: value })}
          style={{
            marginRight: 4,
            padding: '3px 10px',
            borderRadius: 6,
            border: '1px solid #3a4052',
            cursor: 'pointer',
            color: '#fff',
            background: one(q.llpv) === value ? '#3d5afe' : '#232634',
          }}
        >
          {label}
        </button>
      ))}
    </div>
    <small style={{ display: 'block', color: '#9aa3b8', fontSize: 11 }}>
      Replaces the log with sample lines (turn headers, damage, triggers, On
      Death, Mysteries). A new game clears them.
    </small>
  </>
);

export const HeroFiguresPanel = ({
  q,
  setParams,
  sliders,
  count,
  pick,
}: PanelProps) => (
  <>
    <label style={row}>
      Hero display{' '}
      <select
        value={one(q.herotype) || 'ring'}
        onChange={(e) =>
          setParams({
            herotype: e.target.value === 'ring' ? null : e.target.value,
          })
        }
      >
        <option value="ring">Ring + sockets (default)</option>
        <option value="figure">Figure card (Vol 14)</option>
      </select>
      <small style={{ display: 'block', color: '#9aa3b8', fontSize: 11 }}>
        Restarts the board. The ring's look is the hero lab's `r_...` params:
        paste them on this URL, or bake them in with `npm run ring`.
      </small>
    </label>
    {sliders(
      (one(q.herotype) || 'ring') === 'ring'
        ? ['lfz0', 'lfz1', 'lrx0', 'lry0', 'lrx1', 'lry1']
        : ['lfz0', 'lfz1', 'lfw0', 'lfw1', 'lfx0', 'lfy0', 'lfx1', 'lfy1'],
    )}
    <label style={row}>
      Figure side{' '}
      <select
        value={one(q.lfs) || 'left'}
        onChange={(e) =>
          setParams({ lfs: e.target.value === 'left' ? null : e.target.value })
        }
      >
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
      The dark shadow under a minion's oval, per state. Darkness 0 = none.
      Selected, aimed and hovered start at 0 (no shadow), as before. Select a
      minion (or use the Minions preview) to see its lifted shadow.
    </small>
    {SHADOW_STATES.map(([s, label]) => (
      <div
        key={s}
        style={{
          margin: '6px 0',
          paddingBottom: 4,
          borderBottom: '1px solid #2a2f3e',
        }}
      >
        <b>{label}</b>
        {sliders([`lsh${s}y`, `lsh${s}b`, `lsh${s}a`])}
      </div>
    ))}
  </>
);

const midKeys = (prefix: string) =>
  MID_KNOBS.filter((k) => k.key.startsWith(prefix)).map((k) => k.key);
const midColour = (
  q: PanelProps['q'],
  setParams: PanelProps['setParams'],
  key: string,
) => {
  const c = ENERGY_COLOURS[key];
  return (
    <label key={key} style={row}>
      <input
        type="color"
        value={`#${/^[0-9a-f]{6}$/i.test(one(q[key])) ? one(q[key]) : c.fallback}`}
        onChange={(e) => setParams({ [key]: e.target.value.slice(1) })}
      />{' '}
      {c.label}{' '}
      {one(q[key]) && (
        <button
          onClick={() => setParams({ [key]: null })}
          style={{ fontSize: 11 }}
        >
          reset
        </button>
      )}
    </label>
  );
};
const midGroup = {
  margin: '8px 0',
  paddingBottom: 4,
  borderBottom: '1px solid #2a2f3e',
} as const;

/**
 * The strip between the two boards: End turn, the status text and clock, the
 * horizontal lines and a turn-timer bar.
 */
export const MiddlePanel = ({ q, setParams, sliders }: PanelProps) => (
  <>
    <small style={{ display: 'block', color: '#9aa3b8', fontSize: 11 }}>
      The strip between the boards. The lab has no turn clock, so the timer bar
      shows the preview fill below; on /play it drains with the real clock.
    </small>
    <div style={midGroup}>
      <b>Horizontal lines and strip</b>
      {midColour(q, setParams, 'lmdlc')}
      {sliders([
        'lmdlw',
        'lmdla',
        'lmdlt',
        'lmdlb',
        'lmdp',
        'lmdpx',
        'lmdg',
        'lmdh',
      ])}
      <label style={row}>
        Items sit{' '}
        <select
          value={one(q.lmdj) || 'start'}
          onChange={(e) =>
            setParams({
              lmdj: e.target.value === 'start' ? null : e.target.value,
            })
          }
        >
          <option value="start">at the left</option>
          <option value="center">in the middle</option>
          <option value="end">at the right</option>
          <option value="between">spread out</option>
        </select>
      </label>
    </div>
    <div style={midGroup}>
      <b>Middle text and clock</b>
      {['lmdtc', 'lmdkc', 'lmdkl'].map((k) => midColour(q, setParams, k))}
      <label style={row}>
        Text sits{' '}
        <select
          value={one(q.lmdta) || 'left'}
          onChange={(e) =>
            setParams({
              lmdta: e.target.value === 'left' ? null : e.target.value,
            })
          }
        >
          <option value="left">at the left</option>
          <option value="center">in the middle</option>
          <option value="right">at the right</option>
        </select>
      </label>
      {sliders([
        'lmdtdx',
        'lmdtdy',
        'lmdts',
        'lmdtw',
        'lmdto',
        'lmdtl',
        'lmdks',
      ])}
    </div>
    <div style={midGroup}>
      <b>End turn button</b>
      {['lmdbc', 'lmdbb', 'lmdbt'].map((k) => midColour(q, setParams, k))}
      <label style={row}>
        Button sits{' '}
        <select
          value={one(q.lmdba) || 'left'}
          onChange={(e) =>
            setParams({
              lmdba: e.target.value === 'left' ? null : e.target.value,
            })
          }
        >
          <option value="left">at the left</option>
          <option value="center">in the middle</option>
          <option value="right">at the right</option>
        </select>
      </label>
      {sliders(midKeys('lmdb'))}
    </div>
    <div style={midGroup}>
      <b>Timer bar</b>
      {['lmdtfc', 'lmdtlc', 'lmdttc'].map((k) => midColour(q, setParams, k))}
      <label style={row}>
        Sits on the strip's{' '}
        <select
          value={one(q.lmdtpos) || 'bottom'}
          onChange={(e) =>
            setParams({
              lmdtpos: e.target.value === 'bottom' ? null : e.target.value,
            })
          }
        >
          <option value="bottom">bottom edge</option>
          <option value="middle">middle</option>
          <option value="top">top edge</option>
        </select>
      </label>
      {sliders([
        'lmdtpv',
        'lmdtb',
        'lmdth',
        'lmdtv',
        'lmdty',
        'lmdtr',
        'lmdtta',
      ])}
    </div>
  </>
);
