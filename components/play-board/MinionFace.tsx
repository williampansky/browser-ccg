import React, { useEffect, useRef, useState } from 'react';
import type { Card, MinionInstance } from '../../engine';
import { artBackground } from './card-face-model';
import { isDamaged, statTone, statusBadges, StatusBadge } from './minion-model';
import { FloatDelta } from './FloatDelta';
import styles from './board-minion.module.scss';

/**
 * What a minion on the board looks like, ported from hsclone's `MinionV2`: an oval portrait of the card's art, a sword badge for Attack
 * at the bottom left and a shield badge for Health at the bottom right (Health turns orange when damaged). Keywords change the drawing:
 * Guard is a steel shield behind the oval, Bubble a ring around it, Concealed a veil over it. The rest are small icons along the top.
 * The button around it (selection, aim and drag states) lives in PlayBoard; this is only the picture.
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

/** True for half a second after the minion's Health goes down, so it can shake (hsclone's "was attacked"). */
const useHurtFlash = (health: number): boolean => {
  const last = useRef(health);
  const [flash, setFlash] = useState(false);
  useEffect(() => {
    const before = last.current;
    last.current = health;
    if (health >= before) return;
    setFlash(true);
    const t = setTimeout(() => setFlash(false), 500);
    return () => clearTimeout(t);
  }, [health]);
  return flash;
};

const GuardShield = () => (
  <svg className={styles.guardShield} viewBox="0 0 120 150" preserveAspectRatio="none" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="bm-guard" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#aab3c4" />
        <stop offset="0.5" stopColor="#5b6478" />
        <stop offset="1" stopColor="#2c3242" />
      </linearGradient>
    </defs>
    <path d="M60 3 L113 20 V72 Q113 122 60 147 Q7 122 7 72 V20 Z" fill="url(#bm-guard)" stroke="#0b0d12" strokeWidth="3" />
    <path d="M60 11 L105 25 V72 Q105 114 60 138 Q15 114 15 72 V25 Z" fill="none" stroke="#e3e8f2" strokeWidth="1.4" opacity="0.55" />
  </svg>
);

interface Props {
  card?: Card;
  m: MinionInstance;
  turn: number;
  /** The viewer's own minion that cannot attack yet (summoning sickness) */
  sick: boolean;
}

export const MinionFace = ({ card, m, turn, sick }: Props) => {
  const hurt = useHurtFlash(m.health);
  const badges = statusBadges(m, turn, sick);
  const attackTone = statTone(m.attack, card?.attack);
  const healthTone = isDamaged(m) ? 'down' : statTone(m.health, card?.health);
  return (
    <>
      <span className={styles.dust} aria-hidden="true" />
      <FloatDelta value={m.health} />
      {m.keywords.guard && <GuardShield />}
      <span
        className={[styles.oval, hurt ? styles.shake : '', m.keywords.hidden ? styles.veiled : '', m.silenced ? styles.muted : ''].join(' ')}
        style={{ backgroundImage: artBackground(m.cardId) }}
      />
      {m.keywords.hidden && <img className={styles.hiddenMark} src="/images/mechanics/HIDDEN.png" alt="" draggable={false} />}
      {m.keywords.bubble && <span className={styles.bubble} />}
      {badges.length > 0 && (
        <span className={styles.badges}>
          {badges.map((b) => (
            <span key={b.kind} className={[styles.badge, styles[`badge_${b.kind}`]].join(' ')} title={b.label} aria-label={b.label}>
              {GLYPH[b.kind]}
            </span>
          ))}
        </span>
      )}
      <span className={[styles.stat, styles.attack, styles[`tone_${attackTone}`]].join(' ')} aria-label={`Attack ${m.attack}`}>
        <img src="/images/ui/stat-attack.png" alt="" draggable={false} />
        <b>{m.attack}</b>
      </span>
      <span className={[styles.stat, styles.health, styles[`tone_${healthTone}`]].join(' ')} aria-label={`Health ${m.health}`}>
        <img src="/images/ui/stat-health.png" alt="" draggable={false} />
        <b>{m.health}</b>
      </span>
      <span className={styles.caption}>{card?.name ?? m.cardId}</span>
    </>
  );
};
