import React, { useEffect, useRef, useState } from 'react';
import { heroArtLayers, skillIconLayers } from './hero-images';
import styles from './hero-variants.module.scss';
import cx from '../../utils/cx';
import { artBackground, PLACEHOLDER_ART } from './card-face-model';
import { getImpactMs, IMPACT_MS, reducedMotion } from './motion';
import { useImpactDelayed } from './use-impact-delayed';

/**
 * PROTOTYPE hero displays 2 to 4 (option 1 is HeroBust): the standing figure,
 * the big medallion and the hero as a framed card.
 * Dev preview only (pages/hero-lab.tsx); /play does not use them.
 */
/**
 * A weapon whose art file is missing (a 404) tries the next file in its
 * `data-fallbacks` list (space separated), then shows the placeholder instead
 * of a broken image.
 */
const weaponArtFallback = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const image = e.currentTarget;
  if (image.src.endsWith(PLACEHOLDER_ART)) return;

  const [next, ...rest] = (image.dataset.fallbacks ?? '')
    .split(' ')
    .filter(Boolean);
  image.dataset.fallbacks = rest.join(' ');
  image.src = next ?? PLACEHOLDER_ART;
};

export interface HeroVariantProps {
  heroId: string;
  name: string;
  health: number;
  maxHealth?: number;
  armor?: number;
  /** PROTOTYPE: an equipped weapon drawn over the portrait (HeroFigure only) */
  weapon?: {
    image?: string;
    /** Files to try, in order, if `image` is missing */
    fallbacks?: string[];
    attack: number;
    durability: number;
    name?: string;
    temporary?: boolean;
  };
  team?: 'green' | 'red';
  active?: boolean;
  turnTag?: string;
}

const tone = (health: number, maxHealth: number) =>
  health <= maxHealth / 3 ? styles.low : health < maxHealth ? styles.hurt : '';
const SKILL_SLOTS = [1, 2, 3];
const MIDDLE_SLOT = 2;

/** Where a skill socket sits on the ring (deg); slot 2 is the centre one. */
const slotAngle = (
  r: { skillAngle: number; skillSpacing: number },
  slot: number,
): number => r.skillAngle + (MIDDLE_SLOT - slot) * r.skillSpacing;

/**
 * The skill sockets to draw: only those that hold a skill (skills 2 and 3 are
 * shelved), or all three when no skills are given (the lab previews).
 */
const visibleSlots = (p: { skills?: FigureSkill[] }): number[] =>
  SKILL_SLOTS.filter((slot) => !p.skills || p.skills[slot - 1]);

const art = (id: string) => heroArtLayers(id, 'avatar');
const root = (p: HeroVariantProps, extra: string) =>
  cx(
    styles.root,
    extra,
    p.team === 'red' ? styles.red : '',
    p.active ? styles.active : '',
  );

/**
 * 2: the hero as a tall framed figure, laid out like the TCG Vol 14 sample
 * card: portrait in the window, name on the ribbon, skills
 * in the text panel, big green gem = health (in the ring), blue gem = armor.
 * Positions are in the frame PNG's 857 x 1200 units, as percentages, so the
 * card scales with its width.
 */
export interface FigureSkill {
  name: string;
  cost: number;
  text: string;
  /**
   * Ready to use right now; false = dimmed and disabled (no energy, not your
   * turn)
   */
  usable: boolean;
  /** Own turns left before it is ready again; 0 when ready */
  cooldownLeft: number;
  /** A one-use ultimate that has been used */
  spent: boolean;
  selected?: boolean;
  targeted?: boolean;
  /** A card that replaced this skill mid-game: its art is the icon */
  artCardId?: string;
}

export interface FigureLive {
  /** The board tracks this node (aim arrows point at the hero) */
  rootRef?: (el: HTMLElement | null) => void;
  /** Ref for skill n's button (aim arrows start there) */
  skillRef?: (index: number) => (el: HTMLElement | null) => void;
  onSkill?: (index: number) => void;
  aim?: boolean;
  aimHover?: boolean;
  selected?: boolean;
  canAct?: boolean;
  /** Mouse, drag and click handlers for the whole card */
  dom?: React.HTMLAttributes<HTMLDivElement>;
}

export const HeroFigure = (
  p: HeroVariantProps & { skills?: FigureSkill[] } & FigureLive,
) => {
  const max = p.maxHealth ?? 30;
  const health = useImpactDelayed(p.health);
  const armor = useImpactDelayed(p.armor ?? 0);
  const state =
    health <= max / 3 ? styles.low : health < max ? styles.hurt : styles.ok;
  return (
    <div
      {...p.dom}
      ref={p.rootRef}
      className={cx(
        root(p, styles.figure),
        p.canAct ? styles.canAct : '',
        p.aim ? styles.aim : '',
        p.aim && p.aimHover ? styles.aimHover : '',
        p.selected ? styles.sel : '',
      )}
    >
      <div
        className={styles.figPic}
        style={{ backgroundImage: art(p.heroId) }}
      />
      <img
        className={styles.figFrame}
        src="/images/frames/HERO-VOL14.png"
        alt=""
        draggable={false}
      />
      {p.weapon && (
        <div
          className={cx(
            styles.figWeapon,
            p.weapon.image ? '' : styles.figWeaponBare,
            p.weapon.temporary ? styles.figWeaponTemp : '',
          )}
          aria-label={`${p.weapon.name ?? 'Weapon'}: ${p.weapon.attack} attack, ${p.weapon.durability} durability${p.weapon.temporary ? ', this turn only' : ''}`}
        >
          {p.weapon.image && (
            <img
              src={p.weapon.image}
              alt=""
              data-fallbacks={p.weapon.fallbacks?.join(' ')}
              draggable={false}
              onError={weaponArtFallback}
            />
          )}
          <b className={styles.figWpnAtk}>{p.weapon.attack}</b>
          <b className={styles.figWpnDur}>{p.weapon.durability}</b>
        </div>
      )}
      <span className={styles.figName}>{p.name}</span>
      <div className={styles.figSkills}>
        {visibleSlots(p).map((n) => {
          const k = p.skills?.[n - 1];
          const status = !k
            ? ''
            : k.spent
              ? 'Used'
              : k.cooldownLeft > 0
                ? `Ready in ${k.cooldownLeft}`
                : '';
          return (
            <button
              key={n}
              ref={p.skillRef?.(n - 1)}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                p.onSkill?.(n - 1);
              }}
              disabled={!!k && !k.usable}
              aria-label={
                k
                  ? `${k.name}, cost ${k.cost}${status ? `, ${status}` : ''}: ${k.text}`
                  : `Skill ${n}`
              }
              className={cx(
                styles.figSkill,
                k?.usable ? styles.ready : '',
                k?.selected ? styles.picked : '',
                k && !k.usable ? styles.off : '',
              )}
              style={{
                backgroundImage: skillIconLayers(p.heroId, n, k?.artCardId),
              }}
            >
              {k && <b className={styles.figCost}>{k.cost}</b>}
              {k?.targeted && <i className={styles.figTarget}>⌖</i>}
              {status && (
                <em className={styles.figStatus}>
                  {k?.spent ? '✕' : k?.cooldownLeft}
                </em>
              )}
              {k && (
                <span data-tip="" className={styles.figTip}>
                  <strong>{k.name}</strong>
                  {status && (
                    <em>
                      <small> ({status})</small>
                    </em>
                  )}
                  <br />
                  {k.text}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {!!armor && (
        <span
          className={cx(styles.figGem, styles.figArmor)}
          aria-label={`${armor} armor`}
        >
          <b>{armor}</b>
        </span>
      )}
      <span
        className={cx(styles.figGem, styles.figHp, state)}
        aria-label={`${health} health`}
      >
        <b>{health}</b>
      </span>
    </div>
  );
};

/**
 * 3: a big round portrait; health is the outer arc, armor a thinner arc inside
 * it, the number sits at the bottom.
 */
export const HeroMedallion = (p: HeroVariantProps) => {
  const max = p.maxHealth ?? 30;
  const t = tone(p.health, max);
  const hp =
    t === styles.low ? '#a01212' : t === styles.hurt ? '#e0841f' : '#d8372c';
  return (
    <div className={root(p, styles.medal)}>
      <div
        className={styles.medalRing}
        style={{
          ['--fill' as string]: `${(Math.min(p.health, max) / max) * 360}deg`,
          ['--hp' as string]: hp,
        }}
      >
        {!!p.armor && (
          <span
            className={styles.medalArmor}
            style={{
              ['--armor' as string]: `${Math.min(p.armor / 15, 1) * 360}deg`,
            }}
          />
        )}
        <span
          className={styles.medalFace}
          style={{ backgroundImage: art(p.heroId) }}
        />
      </div>
      {p.turnTag && (
        <span className={cx(styles.turnTag, styles.medalTag)}>{p.turnTag}</span>
      )}
      <span className={cx(styles.hpGem, styles.medalHp, styles.num, t)}>
        {p.health}
      </span>
      <span className={styles.medalName}>{p.name}</span>
    </div>
  );
};

/**
 * 4: the hero drawn like the hand cards: art in a rarity frame, name on the
 * ribbon, health and armor in the corners.
 */
export const HeroCard = (p: HeroVariantProps) => {
  const max = p.maxHealth ?? 30;
  return (
    <div className={root(p, styles.card)}>
      <span
        className={styles.cardArt}
        style={{ backgroundImage: art(p.heroId) }}
      />
      <img
        className={styles.cardFrame}
        src={`/images/frames/${p.team === 'red' ? 'RED' : 'GREEN'}.png`}
        alt=""
        draggable={false}
      />
      <span className={styles.cardName}>{p.name}</span>
      <span className={cx(styles.hpGem, styles.num, tone(p.health, max))}>
        {p.health}
      </span>
      {!!p.armor && (
        <span className={cx(styles.armorGem, styles.num)}>{p.armor}</span>
      )}
      {p.turnTag && (
        <span className={cx(styles.turnTag, styles.cardTag)}>{p.turnTag}</span>
      )}
    </div>
  );
};

/**
 * 5: a thin dark ring with the portrait inside and the stats orbiting its rim
 * like a watch face: the skills along the left (9 o'clock),
 * the weapon at 3 o'clock, a pill-shaped health badge at 6 o'clock and an armor
 * pill beside it. Kept thin and dark so it does not read as
 * a thick sculpted bezel. Every size, angle and colour is in `RingTune` (the
 * hero lab's ring tab edits it).
 * Angles are CSS ones: 0deg = 3 o'clock, 90deg = 6, 180deg = 9, 270deg = 12.
 */
export interface RingTune {
  /** Ring diameter and thickness, socket diameter (px) */
  d: number;
  w: number;
  sock: number;
  /**
   * How far the sockets / pills sit out from the rim (px; negative = inside the
   * ring)
   */
  rimSock: number;
  rimPill: number;
  /**
   * The middle skill's angle, and the angle between skills (the first skill is
   * above the middle one)
   */
  skillAngle: number;
  skillSpacing: number;
  weaponAngle: number;
  hpAngle: number;
  armorAngle: number;
  /**
   * The armor pill's own size (a circle when equal) and its own offset from the
   * rim (px, minus = inside)
   */
  armorW: number;
  armorH: number;
  rimArmor: number;
  armorFont: number;
  /**
   * The weapon's attack and durability pills: one size (a circle when equal)
   * and font for both, plus a nudge for each (px, from its default corner)
   */
  wpnW: number;
  wpnH: number;
  wpnFont: number;
  atkX: number;
  atkY: number;
  durX: number;
  durY: number;
  pillW: number;
  pillH: number;
  pillFont: number;
  /** Colours as 6-digit hex without the # */
  ringColour: string;
  socketColour: string;
  /**
   * Health colours (hex, no #): full (at max), graze (over two thirds), hurt
   * (over a third) and low (a third of max or less); the pill, arc and liquid
   * all use them
   */
  hpFull: string;
  hpGraze: string;
  hpHurt: string;
  hpLow: string;
  showName: boolean;
  showTag: boolean;
  showCost: boolean;
  /**
   * Health as an arc around the outside of the ring: it fills from `hpArcStart`
   * toward `hpArcEnd` (CSS angles), `hpArcOffset` px out from the rim
   */
  hpArc: boolean;
  hpArcStart: number;
  hpArcEnd: number;
  hpArcOffset: number;
  hpArcWidth: number;
  /**
   * Health as liquid in a hollow glass ring around a smaller portrait: it
   * sloshes when health changes and bubbles rise. `liquidBand` is the ring's
   * width (px), `liquidAlpha` the liquid's opacity (0 to 100)
   */
  hpLiquid: boolean;
  liquidBand: number;
  liquidAlpha: number;
  /** Bubbles rising on each side of the liquid ring */
  liquidBubbles: number;
  /**
   * A metal bezel picture behind the disc
   * (`public/images/ui/hero-ring-bezel.png`); 0 = off, 100 = its inner edge
   * sits on the disc's rim, bigger = larger
   */
  bezel: number;
  /**
   * A metal frame around the skill and weapon sockets
   * (`public/images/ui/hero-socket-frame.png`): its outer diameter in px, 0 =
   * off. Only the frame picture changes size; `sock` still sizes the socket and
   * what is in it
   */
  frame: number;
  /**
   * Where the Mystery socket sits (deg, 0 = 3 o'clock); it only shows while a
   * Mystery is set
   */
  mysteryAngle: number;
  /** Taking damage: the ring shakes (`hitShake` px sideways, `hitTilt` deg, over `hitShakeMs`; 0 px and 0 deg = no shake) and the amount floats up from the
   *  middle (`popSize` px, `popRise` px up, over `popMs`; `showPop` off hides it). Both wait `hitDelay` ms, so they land with an attack's strike. Healing shows
   *  the same number in `healColour`. */
  hitShake: number;
  hitTilt: number;
  hitShakeMs: number;
  hitDelay: number;
  showPop: boolean;
  popSize: number;
  popRise: number;
  popMs: number;
  popY: number;
  hitColour: string;
  healColour: string;
}

export const RING_DEFAULTS: RingTune = {
  d: 170,
  w: 1,
  sock: 48,
  rimSock: 20,
  rimPill: -12,
  skillAngle: 270,
  skillSpacing: 40,
  weaponAngle: -175,
  hpAngle: 90,
  armorAngle: 75,
  armorW: 24,
  armorH: 24,
  rimArmor: 4,
  armorFont: 12,
  wpnW: 18,
  wpnH: 18,
  wpnFont: 10,
  atkX: 0,
  atkY: 1,
  durX: 0,
  durY: 1,
  pillW: 40,
  pillH: 26,
  pillFont: 14,
  ringColour: '0b0d14',
  socketColour: '151925',
  hpFull: '4ce1a0',
  hpGraze: '96e14c',
  hpHurt: 'f09b4c',
  hpLow: 'ff3333',
  showName: false,
  showTag: false,
  showCost: true,
  hpArc: false,
  hpArcStart: 180,
  hpArcEnd: 360,
  hpArcOffset: 22,
  hpArcWidth: 8,
  hpLiquid: true,
  liquidBand: 15,
  liquidAlpha: 85,
  liquidBubbles: 12,
  bezel: 100,
  frame: 66,
  mysteryAngle: 25,
  hitShake: 6,
  hitTilt: 2,
  hitShakeMs: 450,
  hitDelay: IMPACT_MS,
  showPop: true,
  popSize: 34,
  popRise: 64,
  popMs: 1000,
  popY: 50,
  hitColour: 'ff5d4a',
  healColour: '5fe38a',
};

const arcPath = (radius: number, from: number, to: number) => {
  const pt = (deg: number) =>
    `${(radius * Math.cos((deg * Math.PI) / 180)).toFixed(2)} ${(radius * Math.sin((deg * Math.PI) / 180)).toFixed(2)}`;
  return `M ${pt(from)} A ${radius} ${radius} 0 ${Math.abs(to - from) > 180 ? 1 : 0} ${to > from ? 1 : 0} ${pt(to)}`;
};

/**
 * Bubble `i` of `n` on one side: left % of the band, size px, delay s, duration
 * s. Spread by the golden ratio so they never line up.
 */
const bubble = (
  i: number,
  side: number,
  n: number,
): [number, number, number, number] => {
  const f = (k: number) => ((i + 1) * k + side * 0.37) % 1;
  return [
    8 + f(0.618) * 70,
    2 + Math.round(f(0.382) * 4),
    (i / n) * 5 + side * 0.9,
    3.4 + f(0.754) * 2.6,
  ];
};
const WAVE = 'M0 6 Q25 0 50 6 T100 6 T150 6 T200 6 V12 H0 Z';

/**
 * The liquid inside the disc. `level` is 0 to 1; a change in health restarts
 * the slosh (a tilt and a taller wave) at a strength set by the size of the
 * change.
 */
const Liquid = (p: {
  level: number;
  health: number;
  max: number;
  tone: string;
  alpha: number;
  bubbles: number;
}) => {
  const prev = React.useRef(p.health);
  const [slosh, setSlosh] = React.useState({ n: 0, strength: 0 });
  React.useEffect(() => {
    if (p.health === prev.current) return;
    const strength = Math.min(
      1,
      0.35 + (Math.abs(p.health - prev.current) / p.max) * 3,
    );
    prev.current = p.health;
    setSlosh((s) => ({ n: s.n + 1, strength }));
  }, [p.health, p.max]);
  return (
    <span
      className={cx(styles.ringLiquid, p.tone)}
      style={{
        ['--lvl' as string]: p.level,
        ['--liq-a' as string]: p.alpha / 100,
        ['--slosh' as string]: slosh.strength,
      }}
    >
      <span
        key={slosh.n}
        className={cx(styles.liquidTilt, slosh.n ? styles.sloshing : '')}
      >
        <span className={styles.liquidWaveAmp}>
          <svg
            className={cx(styles.liquidWave, styles.waveBack)}
            viewBox="0 0 200 12"
            preserveAspectRatio="none"
          >
            <path d={WAVE} />
          </svg>
          <svg
            className={styles.liquidWave}
            viewBox="0 0 200 12"
            preserveAspectRatio="none"
          >
            <path d={WAVE} />
          </svg>
        </span>
        <span className={styles.liquidBody} />
        <span className={styles.liquidDepth}>
          {[0, 1].map((side) => (
            <span
              key={side}
              className={cx(styles.liquidCol, side ? styles.colRight : '')}
            >
              {Array.from({ length: p.bubbles }, (_, i) => {
                const [x, size, delay, dur] = bubble(i, side, p.bubbles);
                return (
                  <i
                    key={i}
                    style={{
                      left: `${x}%`,
                      width: size,
                      height: size,
                      animationDelay: `${delay}s`,
                      animationDuration: `${dur}s`,
                    }}
                  />
                );
              })}
            </span>
          ))}
        </span>
      </span>
    </span>
  );
};

/**
 * What the ring does when its hero is hurt or healed: `hits` counts damage
 * (health or armor lost) so the ring can restart its shake each
 * time, and `pops` are the numbers floating up (negative = damage, positive =
 * health gained). Both wait `r.hitDelay` ms. The first render never reacts.
 */
const useRingHit = (health: number, armor: number, r: RingTune) => {
  const last = useRef({ health, armor });
  const next = useRef(1);
  const [hits, setHits] = useState(0);
  const [pops, setPops] = useState<{ id: number; amount: number }[]>([]);
  useEffect(() => {
    const before = last.current;
    last.current = { health, armor };
    const lost =
      Math.max(0, before.health - health) + Math.max(0, before.armor - armor);
    const gained = Math.max(0, health - before.health);
    if ((lost === 0 && gained === 0) || reducedMotion()) return;
    const amount = lost > 0 ? -lost : gained;
    const id = next.current++;
    const timers = [
      setTimeout(
        () => {
          if (lost > 0) setHits((n) => n + 1);
          setPops((old) => [...old, { id, amount }]);
        },
        lost > 0 ? getImpactMs() : 0,
      ),
      setTimeout(
        () => setPops((old) => old.filter((x) => x.id !== id)),
        (lost > 0 ? getImpactMs() : 0) + r.popMs + 50,
      ),
    ];
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [health, armor]);
  return { hits, pops };
};

/**
 * A face-down Mystery on the ring: `cardId` is set for its owner (the card's
 * art shows), left out for the opponent (a question mark).
 */
export interface RingMystery {
  cardId?: string;
  name: string;
  /**
   * Hover text: the card's text for the owner, what it reacts to for the
   * opponent
   */
  tip: string;
}

export const HeroRing = (
  p: HeroVariantProps & {
    skills?: FigureSkill[];
    tune?: Partial<RingTune>;
    mystery?: RingMystery;
  } & FigureLive,
) => {
  const r: RingTune = { ...RING_DEFAULTS, ...p.tune };
  const hit = useRingHit(p.health, p.armor ?? 0, r);
  // The drawn health and armor go down when the hit lands, with the shake.
  const health = useImpactDelayed(p.health);
  const armor = useImpactDelayed(p.armor ?? 0);
  const max = p.maxHealth ?? 30;
  /**
   * The ring has four health states (the other variants keep three): full,
   * graze, hurt, low.
   */
  const t =
    health <= max / 3
      ? styles.low
      : health <= (max * 2) / 3
        ? styles.hurt
        : health < max
          ? styles.graze
          : '';
  const vars = {
    '--ring-d': `${r.d}px`,
    '--ring-w': `${r.w}px`,
    '--sock': `${r.sock}px`,
    '--rim-s': `${r.rimSock}px`,
    '--rim-p': `${r.rimPill}px`,
    '--rim-a': `${r.rimArmor}px`,
    '--armor-w': `${r.armorW}px`,
    '--armor-h': `${r.armorH}px`,
    '--armor-f': `${r.armorFont}px`,
    '--wpn-w': `${r.wpnW}px`,
    '--wpn-h': `${r.wpnH}px`,
    '--wpn-f': `${r.wpnFont}px`,
    '--pill-w': `${r.pillW}px`,
    '--pill-h': `${r.pillH}px`,
    '--pill-f': `${r.pillFont}px`,
    '--bezel-d': `${(r.d / 0.68) * (r.bezel / 100)}px`,
    '--frame-d': `${r.frame}px`,
    '--band': `${r.hpLiquid ? r.liquidBand : 0}px`,
    '--ring-c': `#${r.ringColour}`,
    '--sock-c': `#${r.socketColour}`,
    '--hp-full': `#${r.hpFull}`,
    '--hp-graze': `#${r.hpGraze}`,
    '--hp-hurt': `#${r.hpHurt}`,
    '--hp-low': `#${r.hpLow}`,
    '--hit-amp': `${r.hitShake}px`,
    '--hit-tilt': `${r.hitTilt}deg`,
    '--hit-ms': `${r.hitShakeMs}ms`,
    '--pop-size': `${r.popSize}px`,
    '--pop-rise': `${r.popRise}px`,
    '--pop-ms': `${r.popMs}ms`,
    '--pop-y': `${r.popY}%`,
    '--hit-c': `#${r.hitColour}`,
    '--heal-c': `#${r.healColour}`,
  } as React.CSSProperties;
  return (
    <div
      {...p.dom}
      ref={p.rootRef}
      className={cx(
        root(p, styles.ring),
        p.canAct ? styles.canAct : '',
        p.aim ? styles.aim : '',
        p.aim && p.aimHover ? styles.aimHover : '',
        p.selected ? styles.sel : '',
        hit.hits > 0 ? (hit.hits % 2 ? styles.hitA : styles.hitB) : '',
      )}
      style={vars}
    >
      {r.showPop &&
        hit.pops.map((x) => (
          <span
            key={x.id}
            className={cx(
              styles.ringPop,
              x.amount < 0 ? styles.ringPopHurt : styles.ringPopHeal,
            )}
            aria-hidden="true"
          >
            {x.amount > 0 ? `+${x.amount}` : x.amount}
          </span>
        ))}
      {r.showName && <span className={styles.ringName}>{p.name}</span>}
      {r.showTag && p.turnTag && (
        <span className={cx(styles.turnTag, styles.ringTag)}>{p.turnTag}</span>
      )}
      {r.bezel > 0 && <span className={styles.ringBezel} />}
      <div className={styles.ringDisc}>
        {r.hpLiquid && health > 0 && (
          <Liquid
            level={Math.min(1, health / max)}
            health={health}
            max={max}
            tone={t}
            alpha={r.liquidAlpha}
            bubbles={r.liquidBubbles}
          />
        )}
        <span
          className={cx(styles.ringArt, r.hpLiquid ? styles.ringArtInset : '')}
          style={{ backgroundImage: art(p.heroId) }}
        />
      </div>
      {r.frame > 0 &&
        [
          ...visibleSlots(p).map((slot) => slotAngle(r, slot)),
          ...(p.weapon ? [r.weaponAngle] : []),
          ...(p.mystery ? [r.mysteryAngle] : []),
        ].map((a, i) => (
          <span
            key={i}
            className={styles.ringFrame}
            style={{ ['--a' as string]: `${a}deg` }}
          />
        ))}
      {visibleSlots(p).map((n) => {
        const k = p.skills?.[n - 1];
        const status = !k
          ? ''
          : k.spent
            ? 'Used'
            : k.cooldownLeft > 0
              ? `Ready in ${k.cooldownLeft}`
              : '';
        return (
          <button
            key={n}
            ref={p.skillRef?.(n - 1)}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              p.onSkill?.(n - 1);
            }}
            disabled={!!k && !k.usable}
            aria-label={
              k
                ? `${k.name}, cost ${k.cost}${status ? `, ${status}` : ''}: ${k.text}`
                : `Skill ${n}`
            }
            className={cx(
              styles.ringSock,
              styles.ringSkill,
              k?.usable ? styles.ready : '',
              k?.selected ? styles.picked : '',
              k && !k.usable ? styles.off : '',
            )}
            style={{
              ['--a' as string]: `${slotAngle(r, n)}deg`,
              backgroundImage: skillIconLayers(p.heroId, n, k?.artCardId),
            }}
          >
            {k && r.showCost && <b className={styles.ringCost}>{k.cost}</b>}
            {status && (
              <em className={styles.ringStatus}>
                {k?.spent ? '✕' : k?.cooldownLeft}
              </em>
            )}
            {k && (
              <span data-tip="" className={styles.ringTip}>
                <strong>{k.name}</strong>
                {status && (
                  <em>
                    <small> ({status})</small>
                  </em>
                )}
                <br />
                {k.text}
              </span>
            )}
          </button>
        );
      })}
      {p.weapon && (
        <div
          className={cx(
            styles.ringSock,
            styles.ringWeapon,
            p.weapon.temporary ? styles.ringWeaponTemp : '',
          )}
          style={{ ['--a' as string]: `${r.weaponAngle}deg` }}
          aria-label={`${p.weapon.name ?? 'Weapon'}: ${p.weapon.attack} attack, ${p.weapon.durability} durability`}
        >
          {p.weapon.image && (
            <img
              src={p.weapon.image}
              alt=""
              data-fallbacks={p.weapon.fallbacks?.join(' ')}
              draggable={false}
              onError={weaponArtFallback}
            />
          )}
          <b
            className={cx(styles.ringStat, styles.ringAtk, styles.num)}
            style={{ translate: `${r.atkX}px ${r.atkY}px` }}
          >
            {p.weapon.attack}
          </b>
          <b
            className={cx(styles.ringStat, styles.ringDur, styles.num)}
            style={{ translate: `${r.durX}px ${r.durY}px` }}
          >
            {p.weapon.durability}
          </b>
        </div>
      )}
      {p.mystery && (
        <div
          className={cx(
            styles.ringSock,
            styles.ringMystery,
            p.mystery.cardId ? '' : styles.ringMysteryHidden,
          )}
          style={{
            ['--a' as string]: `${r.mysteryAngle}deg`,
            ...(p.mystery.cardId
              ? { backgroundImage: artBackground(p.mystery.cardId) }
              : {}),
          }}
          aria-label={`Mystery: ${p.mystery.name}. ${p.mystery.tip}`}
        >
          {!p.mystery.cardId && <b className={styles.ringQuestion}>?</b>}
          <span data-tip="" className={styles.ringTip}>
            <strong>{p.mystery.name}</strong>
            <br />
            {p.mystery.tip}
          </span>
        </div>
      )}
      {!!armor && (
        <span
          className={cx(styles.ringPill, styles.ringArmor, styles.num)}
          style={{ ['--a' as string]: `${r.armorAngle}deg` }}
          aria-label={`${armor} armor`}
        >
          {armor}
        </span>
      )}
      {r.hpArc && (
        <svg className={styles.ringArc} aria-hidden="true">
          <path
            d={arcPath(r.d / 2 + r.hpArcOffset, r.hpArcStart, r.hpArcEnd)}
            className={styles.ringArcTrack}
            strokeWidth={r.hpArcWidth}
          />
          {health > 0 && (
            <path
              d={arcPath(
                r.d / 2 + r.hpArcOffset,
                r.hpArcStart,
                r.hpArcStart +
                  (r.hpArcEnd - r.hpArcStart) * Math.min(1, health / max),
              )}
              className={styles.ringArcFill}
              strokeWidth={r.hpArcWidth}
              stroke={`#${t === styles.low ? r.hpLow : t === styles.hurt ? r.hpHurt : t === styles.graze ? r.hpGraze : r.hpFull}`}
            />
          )}
        </svg>
      )}
      <span
        className={cx(styles.ringPill, styles.ringHp, styles.num, t)}
        style={{ ['--a' as string]: `${r.hpAngle}deg` }}
        aria-label={`${health} health`}
      >
        {health}
      </span>
    </div>
  );
};
