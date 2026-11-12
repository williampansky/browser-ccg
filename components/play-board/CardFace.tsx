import React from 'react';
import type { Card } from '../../engine';
import { artUrl, faceUnit, parseRichText, withSpellDamageText, frameFor, gemFor, showsStats, typeLabel } from './card-face-model';
import fontSizeBasedOnCharacterLength from '../../utils/font-size-based-on-length';
import styles from './card-face.module.scss';

interface CardFaceProps {
  card: Card;
  /** How wide to draw the card, in pixels (the height follows: the frame is 1 : 1.4). */
  width: number;
  /** Override the printed attack / health (for a card whose stats are not the printed ones). */
  attack?: number;
  health?: number;
  /** Spell damage on the viewer's board: a spell's damage numbers show raised (in a different colour). */
  spellDamage?: number;
}

/**
 * The framed card from `hsclone`: the art sits behind a rarity frame (a PNG with a see-through window), and the cost
 * gem, name ribbon, text, type, rarity gem and attack/health badges are laid over it. Everything is positioned in the
 * frame's own 178 x 250 design units, scaled by the `--u` custom property (pixels per unit).
 */
export const CardFace = ({ card, width, attack, health, spellDamage = 0 }: CardFaceProps) => {
  const art = artUrl(card.id);
  const stats = showsStats(card.type);
  const label = typeLabel(card);
  return (
    <div className={styles.face} style={{ ['--u' as string]: `${faceUnit(width)}px` }}>
      <div className={styles.art} style={art ? { backgroundImage: `url(${art})` } : undefined} />
      <img className={styles.frame} src={`/images/hs/frames/${frameFor(card.rarity)}.png`} alt="" draggable={false} />
      <img className={styles.gem} src={`/images/hs/ui/gem-${gemFor(card.rarity)}.png`} alt="" draggable={false} />

      <span className={`${styles.cost} ${styles.val}`}>{card.cost}</span>
      <span className={`${styles.type} ${styles.val}`}>{label}</span>

      <span className={styles.emblem}>
        <img className={styles.emblemIcon} src={`/images/hs/ui/type-${card.type.toUpperCase()}.png`} alt="" draggable={false} />
        <img className={styles.emblemBoard} src="/images/hs/ui/type-board.png" alt="" draggable={false} />
      </span>

      <span className={`${styles.name} ${styles.val}`}>
        <span style={{ fontSize: `${fontSizeBasedOnCharacterLength(card.name ?? '')}em` }}>{card.name}</span>
      </span>
      <span className={`${styles.text} ${styles.val}`}>
        <span>
          {parseRichText(withSpellDamageText(card.richText || card.text, card.type === 'spell' ? spellDamage : 0)).map((part, i) =>
            part.kind === 'br' ? (
              <br key={i} />
            ) : part.kind === 'text' ? (
              <React.Fragment key={i}>{part.text}</React.Fragment>
            ) : part.kind === 'boost' ? (
              <span key={i} className={styles.boost}>
                {part.text}
              </span>
            ) : part.kind === 'small' ? (
              <small key={i} className={styles.small}>
                {part.text}
              </small>
            ) : (
              React.createElement(part.kind, { key: i }, part.text)
            )
          )}
        </span>
      </span>

      {stats && (
        <>
          <span className={styles.attack}>
            <img src="/images/hs/ui/stat-attack.png" alt="" draggable={false} />
            <b className={styles.val}>{attack ?? card.attack}</b>
          </span>
          <span className={styles.health}>
            <img src="/images/hs/ui/stat-health.png" alt="" draggable={false} />
            <b className={styles.val}>{health ?? card.health}</b>
          </span>
        </>
      )}
    </div>
  );
};
