import React, { useEffect, useLayoutEffect, useRef } from 'react';
import type { Card } from '../../engine';
import { artBackground, faceUnit, fitScale, parseRichText, withSpellDamageText, frameFor, gemFor, raceLabel, showsStats, typeLabel } from './card-face-model';
import fontSizeBasedOnCharacterLength from '../../utils/font-size-based-on-length';
import styles from './card-face.module.scss';
import { VectorEmblem, VectorFrame, VectorGem, VectorStat } from './vector-frame';

// useLayoutEffect warns during server rendering; the fit only matters in the browser.
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

interface CardFaceProps {
  card: Card;
  /** How wide to draw the card, in pixels (the height follows: the frame is 1 : 1.4). */
  width: number;
  /** Override the printed attack / health (for a card whose stats are not the printed ones). */
  attack?: number;
  health?: number;
  /** Spell damage on the viewer's board: a spell's damage numbers show raised (in a different colour). */
  spellDamage?: number;
  /** What the card costs the viewer right now, if a card on the board changes it (shown green when lower, red when higher). */
  cost?: number;
  /** PROTOTYPE: draw the frame, gem, emblem and stat badges as inline SVG instead of the PNG files (see `vector-frame.tsx`). */
  vector?: boolean;
}

/**
 * The framed card from `hsclone`: the art sits behind a rarity frame (a PNG with a see-through window), and the cost
 * gem, name ribbon, text, type, rarity gem and attack/health badges are laid over it. Everything is positioned in the
 * frame's own 178 x 250 design units, scaled by the `--u` custom property (pixels per unit).
 */
export const CardFace = ({ card, width, attack, health, spellDamage = 0, cost, vector = false }: CardFaceProps) => {
  const stats = showsStats(card.type);
  const label = typeLabel(card);
  const race = raceLabel(card);
  const html = withSpellDamageText(card.richText || card.text, card.type === 'spell' ? spellDamage : 0);

  // Shrink the description until it sits inside its box (long text wrapped to five lines and ran over the badges).
  const textRef = useRef<HTMLSpanElement | null>(null);
  useIsoLayoutEffect(() => {
    const box = textRef.current;
    const inner = box?.firstElementChild as HTMLElement | null;
    if (!box || !inner) return;
    const fit = () => {
      const cs = getComputedStyle(box);
      const availH = box.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      const availW = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      if (!(availH > 0)) return; // not laid out (hidden, or no layout engine): leave the text at full size
      const inBox = (s: number) => {
        box.style.setProperty('--text-scale', String(s));
        return inner.offsetHeight <= availH + 0.5 && inner.scrollWidth <= availW + 0.5;
      };
      // Text with its own line breaks was written to read as those lines: first try to keep each on one row (down to 0.8),
      // and only if that cannot be done, just make it fit the box.
      const lines = inner.querySelectorAll('br').length + 1;
      const rowH = parseFloat(getComputedStyle(inner).lineHeight);
      const keepsLines = (s: number) => inBox(s) && (!(rowH > 0) || inner.offsetHeight <= lines * rowH + 1);
      const strict = lines > 1 ? fitScale(keepsLines, 0.8) : 1;
      const scale = lines > 1 && keepsLines(strict) ? strict : fitScale(inBox);
      box.style.setProperty('--text-scale', String(scale));
    };
    fit();
    // The card font may still be loading on the first draw; measure again once it is in.
    let cancelled = false;
    document.fonts?.ready.then(() => !cancelled && fit());
    return () => {
      cancelled = true;
    };
  }, [html, width]);
  return (
    <div className={styles.face} style={{ ['--u' as string]: `${faceUnit(width)}px` }}>
      <div className={styles.art} style={{ backgroundImage: artBackground(card.id) }} />
      {vector ? (
        <>
          <VectorFrame className={styles.frame} rarity={frameFor(card.rarity)} />
          <VectorGem className={styles.gem} rarity={gemFor(card.rarity)} />
        </>
      ) : (
        <>
          <img className={styles.frame} src={`/images/frames/${frameFor(card.rarity)}.png`} alt="" draggable={false} />
          <img className={styles.gem} src={`/images/ui/gem-${gemFor(card.rarity)}.png`} alt="" draggable={false} />
        </>
      )}

      <span
        className={`${styles.cost} ${styles.val} ${cost !== undefined && cost < card.cost ? styles.costLower : ''} ${cost !== undefined && cost > card.cost ? styles.costHigher : ''}`}
      >
        {cost ?? card.cost}
      </span>
      <span className={`${styles.type} ${styles.val}`}>{label}</span>
      {race && <span className={styles.race}>{race}</span>}

      <span className={styles.emblem}>
        {vector ? (
          <VectorEmblem className={styles.emblemBoard} rarity={frameFor(card.rarity)} type={card.type} />
        ) : (
          <>
            <img className={styles.emblemIcon} src={`/images/ui/type-${card.type.toUpperCase()}.png`} alt="" draggable={false} />
            <img className={styles.emblemBoard} src="/images/ui/type-board.png" alt="" draggable={false} />
          </>
        )}
      </span>

      <span className={`${styles.name} ${styles.val}`}>
        <span style={{ fontSize: `${fontSizeBasedOnCharacterLength(card.name ?? '')}em` }}>{card.name}</span>
      </span>
      <span ref={textRef} className={`${styles.text} ${styles.val}`}>
        <span>
          {parseRichText(html).map((part, i) =>
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
            {vector ? <VectorStat kind="attack" /> : <img src="/images/ui/stat-attack.png" alt="" draggable={false} />}
            <b className={styles.val}>{attack ?? card.attack}</b>
          </span>
          <span className={styles.health}>
            {vector ? <VectorStat kind="health" /> : <img src="/images/ui/stat-health.png" alt="" draggable={false} />}
            <b className={styles.val}>{health ?? card.health}</b>
          </span>
        </>
      )}
    </div>
  );
};
