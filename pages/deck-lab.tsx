import { useRouter } from 'next/router';
import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import { DECK_GROUPS } from '../components/deck-lab/deck-knobs';
import { DeckRowView } from '../components/play-board/DeckRowView';
import { DECK_DEFAULTS, deckRowVars, parseDeckTune } from '../components/play-board/deck-row-tune';
import type { DeckRow } from '../components/play-board/deck-rows';
import { loadHsCards } from '../engine';
import styles from '../components/play-board/play-board.module.scss';

/**
 * Deck lab (dev only): the look of the deck-tracker rows on /play, with the card's `-DECK` strip behind each name. Every value is a `d_<field>`
 * URL param (DeckTune in components/play-board/deck-row-tune.ts), so a setup is a URL: `npm run deck -- "<this page's url>"` bakes it into
 * DECK_DEFAULTS, which /play uses. `w` sets the width of the preview panel (not baked: the panel's width is the board lab's).
 */
const panelBtn: CSSProperties = { padding: '4px 12px', borderRadius: 6, border: '1px solid #3a4052', background: '#232734', color: '#fff', cursor: 'pointer' };

/** A spread of real CORE cards (every kind of cost), some with copies and some used up, so every row state shows. */
const sampleRows = (): DeckRow[] => {
  const cards = Array.from(loadHsCards().byId.values())
    .filter((c): c is typeof c & { name: string } => c.id.startsWith('CORE_') && !!c.name)
    .sort((a, b) => a.id.localeCompare(b.id));
  const picks = cards.filter((_, i) => i % 7 === 3).slice(0, 16);
  return picks
    .map((c, i) => {
      const total = i % 3 === 0 ? 2 : 1;
      return { id: c.id, name: c.name, cost: c.cost ?? 0, total, left: i % 5 === 2 ? 0 : i % 4 === 1 && total === 2 ? 1 : total };
    })
    .sort((a, b) => a.cost - b.cost || a.name.localeCompare(b.name));
};

const DeckLab = () => {
  const router = useRouter();
  // The router has the query once it is ready (before that the server and the first client render both use the defaults, so they match).
  const search = router.isReady ? router.asPath.split('?')[1] ?? '' : '';
  const tune = useMemo(() => parseDeckTune(search), [search]);
  const rows = useMemo(sampleRows, []);
  const q1 = (k: string) => (Array.isArray(router.query[k]) ? router.query[k]?.[0] : (router.query[k] as string | undefined)) ?? '';
  const width = Math.min(700, Math.max(120, +q1('w') || 242));
  const setParams = (changes: Record<string, string | null>) => {
    const query = { ...router.query };
    Object.entries(changes).forEach(([k, v]) => (v === null ? delete query[k] : (query[k] = v)));
    router.replace({ pathname: router.pathname, query }, undefined, { shallow: true });
  };
  const resetAll = () => setParams(Object.fromEntries(Object.keys(router.query).filter((k) => k.startsWith('d_')).map((k) => [k, null])));
  const changed = (field: string) => q1(`d_${field}`) !== '';

  return (
    <main style={{ position: 'fixed', inset: 0, display: 'flex', background: '#14161c', color: '#e8eaf2', padding: 24, gap: 24, boxSizing: 'border-box' }}>
      <aside style={{ flex: '0 0 340px', overflow: 'auto', paddingRight: 12, paddingBottom: 48, borderRight: '1px solid #2a2f3d' }}>
        <h1 style={{ margin: '0 0 8px' }}>Deck lab</h1>
        <button onClick={resetAll} style={panelBtn}>Reset deck look</button>
        <small style={{ color: '#9aa3b8', display: 'block', margin: '6px 0' }}>
          The setup is in the page URL (<code>d_...</code>). Bake it in with <code>npm run deck -- &quot;&lt;url&gt;&quot;</code>.
        </small>
        <label style={{ display: 'block', margin: '6px 0', fontSize: 12 }}>
          <span style={{ display: 'flex', justifyContent: 'space-between' }}><span>Preview width (px, not saved)</span><b>{width}</b></span>
          <input type="range" min={120} max={700} value={width} style={{ width: '100%', margin: 0 }} onChange={(e) => setParams({ w: e.target.value })} />
        </label>
        {DECK_GROUPS.map((g) => (
          <details key={g.title} open={g.open} style={{ borderTop: '1px solid #2a2f3d' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 600, padding: '6px 0' }}>{g.title}</summary>
            {g.flags?.map((f) => (
              <label key={f.field} style={{ display: 'block', margin: '6px 0', fontSize: 12 }}>
                <input type="checkbox" checked={tune[f.field]} onChange={(e) => setParams({ [`d_${f.field}`]: e.target.checked ? '1' : '0' })} /> {f.label}
              </label>
            ))}
            {g.knobs.map((k) => (
              <label key={k.field} style={{ display: 'block', margin: '6px 0', fontSize: 12 }}>
                <span style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ color: changed(k.field) ? '#fff' : '#9aa3b8' }}>{k.label}</span>
                  <span>
                    <b>{tune[k.field]}</b>
                    {changed(k.field) && <a style={{ marginLeft: 6, cursor: 'pointer', color: '#7aa2ff' }} onClick={() => setParams({ [`d_${k.field}`]: null })}>reset</a>}
                  </span>
                </span>
                <input type="range" min={k.min} max={k.max} step={k.step ?? 1} value={tune[k.field]} style={{ width: '100%', margin: 0 }} onChange={(e) => setParams({ [`d_${k.field}`]: e.target.value })} />
              </label>
            ))}
            {g.colours?.map((c) => (
              <label key={c.field} style={{ display: 'block', margin: '6px 0', fontSize: 12 }}>
                <input type="color" value={`#${tune[c.field]}`} onChange={(e) => setParams({ [`d_${c.field}`]: e.target.value.slice(1) })} /> {c.label}
                {changed(c.field) && <a style={{ marginLeft: 6, cursor: 'pointer', color: '#7aa2ff' }} onClick={() => setParams({ [`d_${c.field}`]: null })}>reset</a>}
              </label>
            ))}
          </details>
        ))}
      </aside>
      <section style={{ flex: 1, overflow: 'auto', minWidth: 0 }}>
        <p style={{ color: '#9aa3b8', maxWidth: 560, marginTop: 0 }}>
          The deck panel as /play draws it: real CORE cards, some with two copies, some used up (dimmed). Hover a row to see the shade ease off.
          The strip falls back to the card art, then the placeholder, when a card has no <code>-DECK</code> file.
        </p>
        <div style={{ width, ...(deckRowVars(tune) as CSSProperties) }}>
          <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.5em' }}>
            Deck <small style={{ fontSize: '0.75rem', fontWeight: 400, color: '#aab' }}>{rows.reduce((n, r) => n + r.left, 0)} left</small>
          </h2>
          <div className={styles.deckRows} style={{ overflow: 'visible', flex: 'none' }}>
            {rows.map((r) => (
              <DeckRowView key={r.id} row={r} />
            ))}
          </div>
        </div>
        {JSON.stringify(tune) === JSON.stringify(DECK_DEFAULTS) ? null : (
          <p style={{ color: '#9aa3b8', fontSize: 12 }}>Differs from the saved look (DECK_DEFAULTS).</p>
        )}
      </section>
    </main>
  );
};

export default DeckLab;
