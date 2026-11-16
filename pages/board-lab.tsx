import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useEffect, useMemo } from 'react';
import { heroes, loadHsCards } from '../engine';
import { LabOverlay } from '../components/board-lab/LabOverlay';
import { LabSliders, useMeasuredDefaults } from '../components/board-lab/LabSliders';
import { LAB_TABS, LabSection, LabTabBar, SECTION_KEYS, useLabSections, useLabTab } from '../components/board-lab/lab-sections';
import { BoardPanel, CastPanel, EnergyPanel, MiddlePanel, PlayOverlayPanel, HandsPanel, HeroFiguresPanel, LogDeckPanel, MinionsPanel, RestartPanel, ShadowsPanel, TablePanel } from '../components/board-lab/lab-panels';
import { RESTART_KEYS, SETUP_KEYS, one } from '../components/board-lab/lab-model';
import { BackgroundPanel } from '../components/board-lab/BackgroundPanel';
import { PresetsPanel } from '../components/board-lab/PresetsPanel';
import { EndPanel, useEndTuning } from '../components/board-lab/EndPanel';
import { HoverGapPanel, SoundSlotPanel, useSoundTuning } from '../components/board-lab/SoundPanel';
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
  const { tab, setTab } = useLabTab();
  const defaults = useMeasuredDefaults(q);
  useSoundTuning(q);
  useEndTuning(q);

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
    endPreview: (one(q.lenpv) === 'loss' ? 'loss' : one(q.lenpv) ? 'win' : undefined) as 'win' | 'loss' | undefined,
    castPreview: (one(q.lcpv) === '0' || one(q.lcpv) === '1' ? one(q.lcpv) : undefined) as '0' | '1' | undefined,
    blinkPreview: (one(q.lebpv) === 'spend' || one(q.lebpv) === 'red' ? one(q.lebpv) : undefined) as 'spend' | 'red' | undefined,
    overlayPreview: (['minion', 'minion-hot', 'spell', 'spell-hot'].includes(one(q.lpopv)) ? one(q.lpopv) : undefined) as 'minion' | 'minion-hot' | 'spell' | 'spell-hot' | undefined,
    timerPct: (() => { const v = one(q.lmdtpv) || PLAY_LAYOUT.lmdtpv || ''; return v === '' || Number.isNaN(+v) ? 70 : Math.min(100, Math.max(0, +v)); })(),
    active: (one(q.turn) === '0' || one(q.turn) === '1' ? one(q.turn) : undefined) as '0' | '1' | undefined
  };
  const count = (k: string) => (one(q[k]) ? one(q[k]).split(',').length : 0);

  if (!router.isReady) return null;

  const sliders = (keys: string[]) => <LabSliders keys={keys} q={q} defaults={defaults} setParams={setParams} />;
  const panel = { q, setParams, sliders, count, pick };
  const sec = (id: string, title: string, note: string, children: React.ReactNode) => (
    <LabSection key={id} id={id} title={title} note={note} open={!!sections[id]} onToggle={toggleSection} config={SECTION_KEYS[id] ? { keys: SECTION_KEYS[id], q, setParams } : undefined}>
      {children}
    </LabSection>
  );
  const panels: Record<string, React.ReactNode> = {
    presets: sec('presets', 'Presets', 'saved in this browser', <PresetsPanel />),
    board: sec('board', 'Board', 'live', <BoardPanel {...panel} />),
    restart: sec('restart', 'Heroes and hand', 'restarts the board, same deck each time', <RestartPanel {...panel} />),
    shadows: sec('shadows', 'Minion shadows', 'live', <ShadowsPanel {...panel} />),
    minions: sec('minions', 'Minions', 'live', <MinionsPanel {...panel} />),
    table: sec('table', 'Table', 'live', <TablePanel {...panel} />),
    endgame: sec('endgame', 'End game screen', 'live', <EndPanel {...panel} />),
    middle: sec('middle', 'Middle strip', 'live', <MiddlePanel {...panel} />),
    hands: sec('hands', 'Hands', 'live', <HandsPanel {...panel} />),
    background: sec('background', 'Background', 'live', <BackgroundPanel q={q} setParams={setParams} />),
    play: sec('play', 'Play overlays (green)', 'live', <PlayOverlayPanel {...panel} />),
    cast: sec('cast', 'Played-card overlay', 'live', <CastPanel {...panel} />),
    energy: sec('energy', 'Energy bar', 'live', <EnergyPanel {...panel} />),
    panels: sec('panels', 'Log and deck', 'live', <LogDeckPanel {...panel} />),
    heroes: sec('heroes', 'Hero figures', 'live', <HeroFiguresPanel {...panel} />),
    'snd-cardPlay': sec('snd-cardPlay', 'Card play', 'live; Play to hear', <SoundSlotPanel slot="cardPlay" q={q} setParams={setParams} />),
    'snd-draw': sec('snd-draw', 'Card draw', 'live; Play to hear', <SoundSlotPanel slot="draw" q={q} setParams={setParams} />),
    'snd-cardHover': sec('snd-cardHover', 'Hand hover', 'live; Play to hear', <SoundSlotPanel slot="cardHover" q={q} setParams={setParams} />),
    'snd-hold': sec('snd-hold', 'Held card (loop)', 'live; Play to hear', <SoundSlotPanel slot="hold" q={q} setParams={setParams} />),
    'snd-gap': sec('snd-gap', 'Hover gap', 'live', <HoverGapPanel q={q} setParams={setParams} />),
  };
  return (
    <>
      <style>{css}</style>
      <PlayBoard key={boardKey} lab={lab} />
      <LabOverlay onSetAll={setAllSections}>
        <LabTabBar tab={tab} onTab={setTab} />
        {LAB_TABS.find((t) => t.id === tab)?.sections.map((id) => panels[id])}
      </LabOverlay>
    </>
  );
};

export default BoardLab;
