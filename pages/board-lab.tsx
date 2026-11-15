import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useEffect, useMemo } from 'react';
import { heroes, loadHsCards } from '../engine';
import { LabOverlay } from '../components/board-lab/LabOverlay';
import { LabSliders, useMeasuredDefaults } from '../components/board-lab/LabSliders';
import { LabSection, useLabSections } from '../components/board-lab/lab-sections';
import { BoardPanel, EnergyPanel, HandsPanel, HeroFiguresPanel, LogDeckPanel, MinionsPanel, RestartPanel, TablePanel } from '../components/board-lab/lab-panels';
import { RESTART_KEYS, SETUP_KEYS, one } from '../components/board-lab/lab-model';
import { PresetsPanel } from '../components/board-lab/PresetsPanel';
import { SoundPanel } from '../components/board-lab/SoundPanel';
import { PLAY_LAYOUT, buildLayoutCss } from '../components/play-board/layout-css';

// The real /play board (client only, like /play itself).
const PlayBoard = dynamic(() => import('../components/play-board/PlayBoard').then((m) => m.PlayBoard), { ssr: false });

/**
 * PROTOTYPE page (dev only, not linked): the real /play board, frozen into a setup you choose, with an overlay of layout knobs.
 * Everything is in the URL, so a layout can be shared or bookmarked:
 *  - setup (the same debug params as /play): b0 b1 (board minion ids), turn (0 = player, 1 = enemy; applied live), p0 p1 (hand ids), w0 w1, e0 e1, h0 h1, first, herofig
 *  - layout (CSS overrides over the real stylesheet): lm minion height px, lg minion gap px, lml/lms clicked-minion lift px / scale, lmh aimed-at target scale, lmpv=1 previews it on your first minion, ls section gap px, lw table max width px,
 *    lhs hand sink px, lhw0 / lhw1 my hand / enemy hand card width px, lfw0 / lfw1 my / enemy hero figure width px, lfs hero figure side (left|right), lfx0/lfy0/lfx1/lfy1 hero figure X/Y offsets px,
 *    lsel clicked-card scale, lpv=1 previews it on the first card, lpan log/deck arrangement (swap|stackL|stackR), lsplit stacked log share %,
 *    lgw/ldw log/deck width px, les energy bar scale, lex/ley its X/Y offsets px, leo=h horizontal energy bar, lgx/lgy/ldx/ldy their X/Y offsets px, lfelt=0 hides the felt panel
 * Changing a setup param restarts the board (it is a fresh game each time, not a live one); layout knobs apply instantly.
 * The pieces live in components/board-lab/: lab-model (knob table), lab-panels (the sections), LabOverlay (the floating panel), PresetsPanel, SoundPanel.
 */
const { cards } = loadHsCards();

const BoardLab = () => {
  const router = useRouter();
  const q = router.query;
  const { sections, setAllSections, toggleSection } = useLabSections();
  const defaults = useMeasuredDefaults(q);

  // A stable list of real CORE minions to build boards from.
  const minionIds = useMemo(
    () => cards.filter((c) => c.source === 'core' && !c.isToken && c.type === 'minion' && c.name).map((c) => c.id),
    []
  );
  const pick = (n: number, offset: number) =>
    Array.from({ length: n }, (_, i) => minionIds[(i * 7 + offset) % minionIds.length]).join(',');

  const setParams = (changes: Record<string, string | null>) => {
    const next: Record<string, string | string[] | undefined> = { ...router.query };
    Object.entries(changes).forEach(([k, v]) => (v === null || v === '' ? delete next[k] : (next[k] = v)));
    router.replace({ pathname: router.pathname, query: next }, undefined, { shallow: true });
  };

  // First visit with no setup in the URL: a full-looking board, you going first, the figure heroes.
  useEffect(() => {
    if (!router.isReady) return;
    if (SETUP_KEYS.some((k) => k in router.query)) return;
    setParams({ first: '0', b0: pick(4, 1), b1: pick(3, 2), h0: heroes()[0].id, h1: heroes()[1].id, herofig: '1' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  // With no layout params the lab shows exactly what /play shows (PLAY_LAYOUT); a param in the URL overrides one knob.
  const css = buildLayoutCss({ ...PLAY_LAYOUT, ...Object.fromEntries(Object.keys(q).map((k) => [k, one(q[k])])) });

  const boardKey = RESTART_KEYS.map((k) => one(q[k])).join('|');
  const ids = (k: string) => one(q[k]).split(',').filter(Boolean);
  const energy = (k: string) => (one(q[k]) === '' || Number.isNaN(+one(q[k])) ? undefined : Math.min(10, Math.max(0, +one(q[k]))));
  const lab = {
    boards: { '0': ids('b0'), '1': ids('b1') },
    energy: { '0': energy('e0'), '1': energy('e1') },
    active: (one(q.turn) === '0' || one(q.turn) === '1' ? one(q.turn) : undefined) as '0' | '1' | undefined
  };
  const count = (k: string) => (one(q[k]) ? one(q[k]).split(',').length : 0);

  if (!router.isReady) return null;

  const sliders = (keys: string[]) => <LabSliders keys={keys} q={q} defaults={defaults} setParams={setParams} />;
  const panel = { q, setParams, sliders, count, pick };
  const sec = (id: string, title: string, note: string, children: React.ReactNode) => (
    <LabSection key={id} id={id} title={title} note={note} open={!!sections[id]} onToggle={toggleSection}>
      {children}
    </LabSection>
  );
  return (
    <>
      <style>{css}</style>
      <PlayBoard key={boardKey} lab={lab} />
      <LabOverlay onSetAll={setAllSections}>
        {sec('presets', 'Presets', 'saved in this browser', <PresetsPanel />)}
        {sec('board', 'Board', 'live', <BoardPanel {...panel} />)}
        {sec('restart', 'Heroes and hand', 'restarts the board, same deck each time', <RestartPanel {...panel} />)}
        {sec('minions', 'Minions', 'live', <MinionsPanel {...panel} />)}
        {sec('table', 'Table', 'live', <TablePanel {...panel} />)}
        {sec('hands', 'Hands', 'live', <HandsPanel {...panel} />)}
        {sec('energy', 'Energy bar', 'live', <EnergyPanel {...panel} />)}
        {sec('panels', 'Log and deck', 'live', <LogDeckPanel {...panel} />)}
        {sec('heroes', 'Hero figures', 'live', <HeroFiguresPanel {...panel} />)}
        {sec('sounds', 'Sounds', 'live; Play to hear', <SoundPanel q={q} setParams={setParams} />)}
      </LabOverlay>
    </>
  );
};

export default BoardLab;
