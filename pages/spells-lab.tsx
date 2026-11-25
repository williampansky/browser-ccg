import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';

import { PLAY_LAYOUT } from '../components/play-board/layout-css';
import { SPELL_GROUPS } from '../components/spells-lab/spell-knobs';
import { loadHsCards } from '../engine';
import { createMinion } from '../engine/rules/minion';
import minionStyles from '../components/play-board/board-minion.module.scss';
import { MinionFace } from '../components/play-board/MinionFace';
import { copyLookParams } from '../components/spells-lab/copy-look';
import { spellEntries } from '../components/spells-lab/spell-list';
import type { PixiFx } from '../components/play-board/pixi-fx';
import {
  SPELL_FX_KINDS,
  spellFxForKey,
  spellFxMs,
} from '../components/play-board/spell-fx';
import type { SpellFxKind } from '../components/play-board/spell-fx';
import {
  parseSpellTune,
  SPELL_FX_PARENTS,
  SPELL_FX_VARIANTS,
  tuneForSpell,
} from '../components/play-board/spell-fx-tune';

/**
 * Spells lab (dev only): plays a spell effect between two draggable points on
 * a blank stage, with every number of it as a slider. Each value is an
 * `s_<field>` URL param (`SpellFxTune` in
 * components/play-board/spell-fx-tune.ts), so a setup is a URL. Add an effect
 * to the picker by adding its kind to `EFFECTS` here and its drawing in
 * `pixi-fx.ts`.
 */
const DEFAULT_SPELL = 'WIZARD:1';
/** Where the other targets sit, relative to the first (px). */
const EXTRA_TARGETS = [
  { x: -150, y: 60 },
  { x: 150, y: 60 },
  { x: -80, y: -110 },
  { x: 80, y: -110 },
  { x: 0, y: 150 },
];
const MIN_TARGETS = 2;
const MAX_TARGETS = EXTRA_TARGETS.length + 1;
const DEFAULT_TARGETS = 3;
/** The stage starts after the sidebar (340) and the page padding and gap. */
const STAGE_LEFT = 388;
/** The minion shown as the target, for a sense of scale. */
const SAMPLE_MINION = 'CORE_027';
const SAMPLE_TURN = 3;
const SAMPLE_ID = 900;
const MIN_SPEED = 0.05;
const MAX_SPEED = 2;
const MARKER_SIZE = 56;
const REPLAY_DEBOUNCE_MS = 180;
const LOOP_GAP_MS = 700;
const LOOP_TAIL_MS = 600;

const panelBtn: CSSProperties = {
  padding: '4px 12px',
  borderRadius: 6,
  border: '1px solid #3a4052',
  background: '#232734',
  color: '#fff',
  cursor: 'pointer',
};

const markerStyle = (
  point: { x: number; y: number },
  colour: string,
): CSSProperties => ({
  position: 'fixed',
  left: point.x - MARKER_SIZE / 2,
  top: point.y - MARKER_SIZE / 2,
  width: MARKER_SIZE,
  height: MARKER_SIZE,
  borderRadius: '50%',
  border: `2px dashed ${colour}`,
  color: colour,
  display: 'grid',
  placeItems: 'center',
  fontSize: 11,
  cursor: 'grab',
  touchAction: 'none',
  userSelect: 'none',
  background: 'rgba(255,255,255,0.04)',
});

type Point = { x: number; y: number };

/**
 * The board's saved background (the board lab's Background section, as baked
 * into `PLAY_LAYOUT`): the paper image darkened by `lbgd`, covering the stage.
 */
const boardBackground = (): string => {
  const { lbgd, lbgf } = PLAY_LAYOUT;
  const dark = Math.min(1, Math.max(0, +lbgd || 0));
  const shade = `linear-gradient(rgba(0,0,0,${dark}),rgba(0,0,0,${dark}))`;
  return /^\/[\w./-]+$/.test(lbgf)
    ? `${shade}, url(${lbgf}) center / cover no-repeat`
    : '#14161c';
};

const SpellsLab = () => {
  const router = useRouter();
  const search = router.isReady ? (router.asPath.split('?')[1] ?? '') : '';
  const entries = useMemo(spellEntries, []);
  const fxRef = useRef<PixiFx | null>(null);
  const [points, setPoints] = useState<{ from: Point; to: Point } | null>(null);
  const [isLoop, setLoop] = useState(false);
  const [isReplayOnChange, setReplayOnChange] = useState(true);
  const q1 = (key: string) =>
    (Array.isArray(router.query[key])
      ? router.query[key]?.[0]
      : (router.query[key] as string | undefined)) ?? '';
  const spellKey = q1('sp') || DEFAULT_SPELL;
  const entry = entries.find((candidate) => candidate.key === spellKey);
  const entryIndex = entries.findIndex(
    (candidate) => candidate.key === spellKey,
  );
  const assigned = spellFxForKey(spellKey);
  const override = q1('e');
  const speed = Math.min(
    MAX_SPEED,
    Math.max(MIN_SPEED, Number(q1('speed')) || 1),
  );
  const isMinionShown = q1('minion') === '1';
  const isBoardShown = q1('board') === '1';
  const isMulti = q1('multi') === '1';
  const targetCount = Math.min(
    MAX_TARGETS,
    Math.max(MIN_TARGETS, Math.round(Number(q1('tc'))) || DEFAULT_TARGETS),
  );
  const sample = useMemo(() => {
    const card = loadHsCards().byId.get(SAMPLE_MINION);
    return card
      ? { card, m: createMinion(card, SAMPLE_ID, SAMPLE_TURN, SAMPLE_ID) }
      : null;
  }, []);
  const kind: SpellFxKind =
    SPELL_FX_KINDS.find((effect) => effect.kind === override)?.kind ?? assigned;
  const base = useMemo(() => tuneForSpell(spellKey), [spellKey]);
  const tune = useMemo(() => parseSpellTune(search, base), [search, base]);
  const changed = (field: string) => q1(`s_${field}`) !== '';

  const setParams = (changes: Record<string, string | null>) => {
    const query = { ...router.query };
    Object.entries(changes).forEach(([key, value]) =>
      value === null ? delete query[key] : (query[key] = value),
    );
    router.replace({ pathname: router.pathname, query }, undefined, {
      shallow: true,
    });
  };
  const resetAll = () =>
    setParams(
      Object.fromEntries(
        Object.keys(router.query)
          .filter((key) => key.startsWith('s_'))
          .map((key) => [key, null]),
      ),
    );

  useEffect(() => {
    setPoints({
      from: { x: window.innerWidth * 0.5, y: window.innerHeight * 0.72 },
      to: { x: window.innerWidth * 0.68, y: window.innerHeight * 0.3 },
    });
    let isCurrent = true;
    let created: PixiFx | null = null;
    import('../components/play-board/pixi-fx').then(({ createPixiFx }) => {
      if (!isCurrent) return;
      created = createPixiFx();
      fxRef.current = created;
    });
    return () => {
      isCurrent = false;
      fxRef.current = null;
      created?.destroy();
    };
  }, []);

  // The preview's slow motion: the fx layer scales time, not the effects' ms.
  useEffect(() => {
    fxRef.current?.setSpeed(speed);
  }, [speed]);

  /** The first target, then the others when several targets are shown. */
  const targets = useMemo(() => {
    if (!points) return [];
    const extras = isMulti
      ? EXTRA_TARGETS.slice(0, targetCount - 1).map((offset) => ({
          x: points.to.x + offset.x,
          y: points.to.y + offset.y,
        }))
      : [];
    return [points.to, ...extras];
  }, [isMulti, points, targetCount]);
  /** Animations in one run: a spot effect plays on the first target only. */
  const shotCount =
    Math.max(1, Math.round(tune.volleyCount)) *
    (kind === 'spot' ? 1 : targets.length);

  const play = useCallback((): void => {
    const fx = fxRef.current;
    if (!fx || !points) return;
    fx.setSpeed(speed);
    const ms = spellFxMs(kind, tune);
    const plays = Math.max(1, Math.round(tune.volleyCount));
    // The game's volley: each target plays `plays` times, and every animation
    // starts `volleyDelay` after the one before (slow motion stretches it too).
    const sequence = kind === 'spot' ? [points.to] : targets;
    // One entry per animation. Each runs in its own callback, so a delayed
    // shot keeps its own target (a closure over a loop variable would not).
    const shots = sequence.flatMap((target) =>
      Array.from({ length: plays }, () => target),
    );
    shots.forEach((target, index) => {
      const wait = (index * tune.volleyDelay) / speed;
      const fire = (): void => {
        if (kind === 'strike') fx.strike(target, ms, tune);
        else if (kind === 'spot') fx.spot(target, tune);
        else fx.travel(points.from, target, ms, tune);
      };
      if (wait > 0) setTimeout(fire, wait);
      else fire();
    });
  }, [kind, points, speed, targets, tune]);

  // Space plays; a loop replays after each one has finished.
  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      if (event.code === 'Space' && event.target === document.body) {
        event.preventDefault();
        play();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [play]);

  useEffect(() => {
    if (!isLoop) return;
    const gap =
      spellFxMs(kind, tune) +
      LOOP_GAP_MS +
      shotCount * tune.volleyDelay +
      (kind === 'strike' ? tune.strikeLife : LOOP_TAIL_MS) +
      (kind === 'spot' ? tune.spotLife : 0);
    const timer = setInterval(play, gap / speed);
    return () => clearInterval(timer);
  }, [isLoop, kind, play, shotCount, speed, tune]);

  // A change replays the effect, so a slider can be tuned by eye.
  const firstTune = useRef(true);
  useEffect(() => {
    if (firstTune.current) {
      firstTune.current = false;
      return;
    }
    if (!isReplayOnChange || isLoop) return;
    const timer = setTimeout(play, REPLAY_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [tune, kind, isReplayOnChange, isLoop, play]);

  const [isCarry, setCarry] = useState(false);
  const [typed, setTyped] = useState<string | null>(null);
  /** Moves to another spell; its own saved look starts unless numbers carry. */
  const pickSpell = (key: string): void => {
    const cleared: Record<string, string | null> = { sp: key };
    if (!isCarry) {
      Object.keys(router.query)
        .filter((param) => param.startsWith('s_') || param === 'e')
        .forEach((param) => (cleared[param] = null));
    }
    setTyped(null);
    setParams(cleared);
  };
  const step = (by: number): void => {
    const next = entries[(entryIndex + by + entries.length) % entries.length];
    if (next) pickSpell(next.key);
  };
  /**
   * Copies another spell's saved look (and its base effect) onto this spell as
   * unsaved changes, to tweak and bake: an independent copy, not a link.
   */
  const copyLookFrom = (sourceKey: string): void => {
    const changes: Record<string, string | null> = {};
    Object.keys(router.query)
      .filter((param) => param.startsWith('s_') || param === 'e')
      .forEach((param) => (changes[param] = null));
    Object.assign(
      changes,
      copyLookParams(tuneForSpell(sourceKey), tuneForSpell(spellKey)),
    );
    const sourceFx = spellFxForKey(sourceKey);
    if (sourceFx !== assigned) changes.e = sourceFx;
    setParams(changes);
  };
  const onType = (value: string): void => {
    setTyped(value);
    const match = entries.find((candidate) => candidate.label === value);
    if (match) pickSpell(match.key);
  };

  const drag =
    (which: 'from' | 'to') => (event: ReactPointerEvent<HTMLDivElement>) => {
      const target = event.currentTarget;
      target.setPointerCapture(event.pointerId);
      const move = (moveEvent: PointerEvent): void =>
        setPoints((old) =>
          old
            ? {
                ...old,
                [which]: { x: moveEvent.clientX, y: moveEvent.clientY },
              }
            : old,
        );
      const stop = (): void => {
        target.removeEventListener('pointermove', move);
        target.removeEventListener('pointerup', stop);
      };
      target.addEventListener('pointermove', move);
      target.addEventListener('pointerup', stop);
    };

  return (
    <main
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        background: '#14161c',
        color: '#e8eaf2',
        padding: 24,
        gap: 24,
        boxSizing: 'border-box',
      }}
    >
      <aside
        style={{
          flex: '0 0 340px',
          overflow: 'auto',
          paddingRight: 12,
          paddingBottom: 48,
          borderRight: '1px solid #2a2f3d',
          position: 'relative',
          zIndex: 9100,
        }}
      >
        <h1 style={{ margin: '0 0 8px' }}>Spells lab</h1>
        <label style={{ display: 'block', fontSize: 12 }}>
          Spell (type to search {entries.length} spells and skills)
          <input
            list="spell-options"
            value={typed ?? entry?.label ?? ''}
            onChange={(event) => onType(event.target.value)}
            onFocus={(event) => event.target.select()}
            style={{ width: '100%', boxSizing: 'border-box', padding: 6 }}
          />
          <datalist id="spell-options">
            {entries.map((candidate) => (
              <option key={candidate.key} value={candidate.label}>
                {candidate.group}
              </option>
            ))}
          </datalist>
        </label>
        <div style={{ display: 'flex', gap: 6, margin: '6px 0' }}>
          <button onClick={() => step(-1)} style={panelBtn}>
            ◀ Prev
          </button>
          <button onClick={() => step(1)} style={panelBtn}>
            Next ▶
          </button>
          <label style={{ fontSize: 12, alignSelf: 'center' }}>
            <input
              type="checkbox"
              checked={isCarry}
              onChange={(event) => setCarry(event.target.checked)}
            />{' '}
            Carry my numbers
          </label>
        </div>
        <label style={{ display: 'block', fontSize: 12, margin: '6px 0' }}>
          Copy a look from another spell{' '}
          <select
            value=""
            onChange={(event) => {
              if (event.target.value) copyLookFrom(event.target.value);
            }}
          >
            <option value="">choose a spell...</option>
            {Object.keys(SPELL_FX_VARIANTS)
              .filter((key) => key !== spellKey)
              .map((key) => (
                <option key={key} value={key}>
                  {entries.find((candidate) => candidate.key === key)?.label ??
                    key}
                </option>
              ))}
          </select>
        </label>
        {entry && (
          <div style={{ fontSize: 12, color: '#9aa3b8', margin: '6px 0' }}>
            <b style={{ color: '#e8eaf2' }}>{entry.name}</b> · {entry.group} ·
            cost {entry.cost}
            <br />
            {entry.text}
            <br />
            {SPELL_FX_PARENTS[spellKey] && (
              <>
                Starts from the <b>{SPELL_FX_PARENTS[spellKey]}</b> look; your
                numbers go on top.
                <br />
              </>
            )}
            Assigned effect: <b>{assigned}</b>
            {kind !== assigned && ` (trying ${kind})`}
          </div>
        )}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {SPELL_FX_KINDS.map((effect) => (
            <button
              key={effect.kind}
              onClick={() => setParams({ e: effect.kind })}
              style={{
                ...panelBtn,
                borderColor: effect.kind === kind ? '#7aa2ff' : '#3a4052',
              }}
            >
              {effect.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6, margin: '8px 0' }}>
          <button onClick={play} style={panelBtn}>
            Play (Space)
          </button>
          <button onClick={resetAll} style={panelBtn}>
            Reset numbers
          </button>
        </div>
        <label style={{ display: 'block', fontSize: 12, margin: '4px 0' }}>
          <input
            type="checkbox"
            checked={isLoop}
            onChange={(event) => setLoop(event.target.checked)}
          />{' '}
          Loop
        </label>
        <label style={{ display: 'block', fontSize: 12, margin: '4px 0' }}>
          <input
            type="checkbox"
            checked={isReplayOnChange}
            onChange={(event) => setReplayOnChange(event.target.checked)}
          />{' '}
          Replay when a number changes
        </label>
        <label style={{ display: 'block', fontSize: 12, margin: '4px 0' }}>
          <input
            type="checkbox"
            checked={isMinionShown}
            onChange={(event) =>
              setParams({ minion: event.target.checked ? '1' : null })
            }
          />{' '}
          Show a sample minion as the target
        </label>
        <label style={{ display: 'block', fontSize: 12, margin: '4px 0' }}>
          <input
            type="checkbox"
            checked={isBoardShown}
            onChange={(event) =>
              setParams({ board: event.target.checked ? '1' : null })
            }
          />{' '}
          Show the default board background
        </label>
        <label style={{ display: 'block', fontSize: 12, margin: '4px 0' }}>
          <input
            type="checkbox"
            checked={isMulti}
            onChange={(event) =>
              setParams({ multi: event.target.checked ? '1' : null })
            }
          />{' '}
          Several targets (for a volley or an area spell)
        </label>
        {isMulti && (
          <label style={{ display: 'block', fontSize: 12, margin: '4px 0' }}>
            <span style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>How many targets</span>
              <b>{targetCount}</b>
            </span>
            <input
              type="range"
              min={MIN_TARGETS}
              max={MAX_TARGETS}
              step={1}
              value={targetCount}
              style={{ width: '100%', margin: 0 }}
              onChange={(event) => setParams({ tc: event.target.value })}
            />
          </label>
        )}
        <label style={{ display: 'block', fontSize: 12, margin: '6px 0' }}>
          <span style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Preview speed (slow motion; the effect&apos;s ms stay)</span>
            <b>{Math.round(speed * 100)}%</b>
          </span>
          <input
            type="range"
            min={MIN_SPEED}
            max={MAX_SPEED}
            step={0.05}
            value={speed}
            style={{ width: '100%', margin: 0 }}
            onChange={(event) =>
              setParams({
                speed:
                  Number(event.target.value) === 1 ? null : event.target.value,
              })
            }
          />
        </label>
        <small style={{ color: '#9aa3b8', display: 'block', margin: '6px 0' }}>
          Drag the two circles. The setup is in the page URL (<code>s_...</code>
          ); it is not baked into the game&apos;s defaults yet.
        </small>
        {SPELL_GROUPS.filter(
          (group) =>
            group.kinds.includes(kind) && (!group.when || group.when(tune)),
        ).map((group) => {
          const isOn = !group.flag || tune[group.flag.field];
          return (
            <details
              key={group.title}
              open
              style={{ borderTop: '1px solid #2a2f3d' }}
            >
              <summary
                style={{
                  cursor: 'pointer',
                  fontWeight: 600,
                  padding: '6px 0',
                }}
              >
                {group.title}
              </summary>
              {group.flag && (
                <label
                  style={{ display: 'block', margin: '6px 0', fontSize: 12 }}
                >
                  <input
                    type="checkbox"
                    checked={tune[group.flag.field]}
                    onChange={(event) =>
                      setParams({
                        [`s_${group.flag?.field}`]: event.target.checked
                          ? '1'
                          : '0',
                      })
                    }
                  />{' '}
                  {group.flag.label}
                </label>
              )}
              {isOn &&
                group.choices?.map((choice) => (
                  <label
                    key={choice.field}
                    style={{
                      display: 'block',
                      margin: '6px 0',
                      fontSize: 12,
                    }}
                  >
                    {choice.label}{' '}
                    <select
                      value={tune[choice.field]}
                      onChange={(event) =>
                        setParams({
                          [`s_${choice.field}`]: event.target.value,
                        })
                      }
                    >
                      {choice.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {changed(choice.field) && (
                      <a
                        style={{
                          marginLeft: 6,
                          cursor: 'pointer',
                          color: '#7aa2ff',
                        }}
                        onClick={() =>
                          setParams({ [`s_${choice.field}`]: null })
                        }
                      >
                        reset
                      </a>
                    )}
                  </label>
                ))}
              {isOn &&
                group.knobs
                  .filter((knob) => !knob.when || knob.when(tune))
                  .map((knob) => (
                    <label
                      key={knob.field}
                      style={{
                        display: 'block',
                        margin: '6px 0',
                        fontSize: 12,
                      }}
                    >
                      <span
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: 8,
                        }}
                      >
                        <span
                          style={{
                            color: changed(knob.field) ? '#fff' : '#9aa3b8',
                          }}
                        >
                          {knob.label}
                        </span>
                        <span>
                          <b>{tune[knob.field]}</b>
                          {changed(knob.field) && (
                            <a
                              style={{
                                marginLeft: 6,
                                cursor: 'pointer',
                                color: '#7aa2ff',
                              }}
                              onClick={() =>
                                setParams({ [`s_${knob.field}`]: null })
                              }
                            >
                              reset
                            </a>
                          )}
                        </span>
                      </span>
                      <input
                        type="range"
                        min={knob.min}
                        max={knob.max}
                        step={knob.step ?? 1}
                        value={tune[knob.field]}
                        style={{ width: '100%', margin: 0 }}
                        onChange={(event) =>
                          setParams({
                            [`s_${knob.field}`]: event.target.value,
                          })
                        }
                      />
                    </label>
                  ))}
              {isOn &&
                group.colours?.map((colour) => (
                  <label
                    key={colour.field}
                    style={{
                      display: 'block',
                      margin: '6px 0',
                      fontSize: 12,
                    }}
                  >
                    <input
                      type="color"
                      value={`#${tune[colour.field]}`}
                      onChange={(event) =>
                        setParams({
                          [`s_${colour.field}`]: event.target.value.slice(1),
                        })
                      }
                    />{' '}
                    {colour.label}
                    {changed(colour.field) && (
                      <a
                        style={{
                          marginLeft: 6,
                          cursor: 'pointer',
                          color: '#7aa2ff',
                        }}
                        onClick={() =>
                          setParams({ [`s_${colour.field}`]: null })
                        }
                      >
                        reset
                      </a>
                    )}
                  </label>
                ))}
            </details>
          );
        })}
        {JSON.stringify(tune) === JSON.stringify(base) ? null : (
          <p style={{ color: '#9aa3b8', fontSize: 12 }}>
            Differs from this spell's saved look.
          </p>
        )}
      </aside>
      <section style={{ flex: 1, minWidth: 0 }}>
        {isBoardShown && (
          <div
            aria-hidden="true"
            style={{
              position: 'fixed',
              inset: `0 0 0 ${STAGE_LEFT}px`,
              background: boardBackground(),
              pointerEvents: 'none',
            }}
          />
        )}
        <p style={{ color: '#9aa3b8', maxWidth: 560, marginTop: 0 }}>
          A blank stage. The caster circle is where the effect starts (a strike
          ignores it and comes from the top, and a spot effect opens on the
          target circle); the target circle is where it lands. Press Space or
          Play, or change a number.
        </p>
        {points && (
          <>
            <div
              onPointerDown={drag('from')}
              style={markerStyle(points.from, '#7ad9a2')}
            >
              caster
            </div>
            {isMinionShown && sample ? (
              <div
                onPointerDown={drag('to')}
                style={{
                  position: 'fixed',
                  left: points.to.x,
                  top: points.to.y,
                  transform: 'translate(-50%, -50%)',
                  cursor: 'grab',
                  touchAction: 'none',
                  userSelect: 'none',
                }}
              >
                <div className={minionStyles.slot}>
                  <MinionFace
                    card={sample.card}
                    m={sample.m}
                    sick={false}
                    turn={SAMPLE_TURN}
                  />
                </div>
              </div>
            ) : (
              <div
                onPointerDown={drag('to')}
                style={markerStyle(points.to, '#ff8a8a')}
              >
                target
              </div>
            )}
            {targets.slice(1).map((point, index) =>
              isMinionShown && sample ? (
                <div
                  key={index}
                  style={{
                    position: 'fixed',
                    left: point.x,
                    top: point.y,
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none',
                  }}
                >
                  <div className={minionStyles.slot}>
                    <MinionFace
                      card={sample.card}
                      m={sample.m}
                      sick={false}
                      turn={SAMPLE_TURN}
                    />
                  </div>
                </div>
              ) : (
                <div
                  key={index}
                  style={{
                    ...markerStyle(point, '#ff8a8a'),
                    cursor: 'default',
                    pointerEvents: 'none',
                  }}
                >
                  {index + 2}
                </div>
              ),
            )}
          </>
        )}
      </section>
    </main>
  );
};

export default SpellsLab;
