import React, { useEffect, useRef, useState } from 'react';
import type { Card, MinionInstance } from '../../engine';
import { minionArtBackground } from './card-face-model';
import { getImpactMs } from './motion';
import { isDamaged, statTone, statusBadges, StatusBadge } from './minion-model';
import { FloatDelta } from './FloatDelta';
import styles from './board-minion.module.scss';
import cx from '../../utils/cx';

/**
 * What a minion on the board looks like, ported from hsclone's `MinionV2`: an
 * oval portrait of the card's art, a sword badge for Attack
 * at the bottom left and a shield badge for Health at the bottom right (Health
 * turns orange when damaged). Keywords change the drawing:
 * Guard is a steel shield behind the oval, Bubble a ring around it, Concealed a
 * veil over it. The rest are small icons along the top.
 * The button around it (selection, aim and drag states) lives in PlayBoard;
 * this is only the picture.
 */

const GLYPH: Record<StatusBadge['kind'], string> = {
  rush: '⚡',
  onslaught: '×2',
  disabled: '⛔',
  expiring: '⌛',
  asleep: 'z',
  noAttack: '⊘',
  silenced: '∅',
};

/** How long the shake itself runs (`minionShake` in board-minion.module.scss) */
const SHAKE_MS = 500;

/**
 * True while the minion shakes after its Health goes down (hsclone's "was
 * attacked"): from the drop until the shake, which waits for the attacker's
 * strike, has run. A hero's slam lands later than a minion's lunge, so the
 * wait is read from `getImpactMs()` each time.
 */
const useHurtFlash = (health: number): boolean => {
  const last = useRef(health);
  const [flash, setFlash] = useState(false);
  useEffect(() => {
    const before = last.current;
    last.current = health;
    if (health >= before) return;
    setFlash(true);
    const t = setTimeout(() => setFlash(false), getImpactMs() + SHAKE_MS);
    return () => clearTimeout(t);
  }, [health]);
  return flash;
};

const GuardShield = () => (
  <svg
    className={styles.guardShield}
    viewBox="0 0 120 150"
    preserveAspectRatio="none"
    aria-hidden="true"
    focusable="false"
  >
    <defs>
      <linearGradient id="bm-guard" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#aab3c4" />
        <stop offset="0.5" stopColor="#5b6478" />
        <stop offset="1" stopColor="#2c3242" />
      </linearGradient>
    </defs>
    <path
      d="M60 3 L113 20 V72 Q113 122 60 147 Q7 122 7 72 V20 Z"
      fill="url(#bm-guard)"
      stroke="#0b0d12"
      strokeWidth="3"
    />
    <path
      d="M60 11 L105 25 V72 Q105 114 60 138 Q15 114 15 72 V25 Z"
      fill="none"
      stroke="#e3e8f2"
      strokeWidth="1.4"
      opacity="0.55"
    />
  </svg>
);

interface Props {
  card?: Card;
  m: MinionInstance;
  turn: number;
  /** The viewer's own minion that cannot attack yet (summoning sickness) */
  sick: boolean;
  /** The action being aimed would kill this minion (shows a skull over it) */
  doomed?: boolean;
}

export const MinionFace = ({ card, m, turn, sick, doomed }: Props) => {
  const hurt = useHurtFlash(m.health);
  // Stampede only matters the turn the minion came in: after that its icon
  // fades out, then stays gone.
  const [rushGone, setRushGone] = useState(false);
  const badges = statusBadges(m, turn, sick).filter(
    (b) => !(b.kind === 'rush' && b.fades && rushGone),
  );
  const attackTone = statTone(m.attack, card?.attack);
  const healthTone = isDamaged(m) ? 'down' : statTone(m.health, card?.health);
  return (
    <>
      <span className={styles.dust} aria-hidden="true" />
      <FloatDelta value={m.health} />
      {/* Everything that is part of the minion's body shakes as one piece. */}
      <span className={cx(styles.body, hurt ? styles.shake : '')}>
        {card?.rarity === 'MYTHIC' && (
          <img
            alt=""
            className={styles.mythicFrame}
            draggable={false}
            src="/images/minion-frames/MYTHIC.png"
          />
        )}
        {m.keywords.guard && <GuardShield />}
        <span
          className={cx(
            styles.oval,
            m.keywords.hidden ? styles.veiled : '',
            m.silenced ? styles.muted : '',
            doomed ? styles.doomedPortrait : '',
          )}
        >
          {/* The picture is its own layer inside the oval (which clips it), so it can scale on hover without scaling the frame. */}
          <span
            className={styles.portrait}
            style={{ backgroundImage: minionArtBackground(m.cardId) }}
          />
        </span>
        {doomed && (
          <span className={styles.doomedIcon} role="img" aria-label="Would die">
            ☠
          </span>
        )}
        {m.keywords.hidden && (
          <img
            className={styles.hiddenMark}
            src="/images/mechanics/HIDDEN.png"
            alt=""
            draggable={false}
          />
        )}
        {m.keywords.bubble && <span className={styles.bubble} />}
        {badges.length > 0 && (
          <span className={styles.badges}>
            {badges.map((b) => (
              <span
                key={b.kind}
                className={cx(
                  styles.badge,
                  styles[`badge_${b.kind}`],
                  b.fades ? styles.badgeFade : '',
                )}
                onAnimationEnd={b.fades ? () => setRushGone(true) : undefined}
                title={b.label}
                aria-label={b.label}
              >
                {GLYPH[b.kind]}
              </span>
            ))}
          </span>
        )}
        <span
          className={cx(
            styles.stat,
            styles.attack,
            styles[`tone_${attackTone}`],
          )}
          aria-label={`Attack ${m.attack}`}
        >
          <img src="/images/ui/stat-attack.png" alt="" draggable={false} />
          <b>{m.attack}</b>
        </span>
        <span
          className={cx(
            styles.stat,
            styles.health,
            styles[`tone_${healthTone}`],
          )}
          aria-label={`Health ${m.health}`}
        >
          <img src="/images/ui/stat-health.png" alt="" draggable={false} />
          <b>{m.health}</b>
        </span>
        <span className={styles.caption}>{card?.name ?? m.cardId}</span>
      </span>
    </>
  );
};
