import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import cx from '../../utils/cx';
import type { Card } from '../../engine';
import { CardFace } from './CardFace';
import { deckStripBackground } from './card-face-model';
import type { DeckRow } from './deck-rows';
import styles from './play-board.module.scss';

/** Width of the full-card popup (px) and its gap from the row. */
const POPUP_WIDTH = 220;
const POPUP_GAP = 8;

/**
 * How long after a popup closes the next row still shows its card at once (ms):
 * the pointer is crossing from one row to the next.
 */
const WARM_GRACE_MS = 250;
/**
 * Shared by every row: until when a row's card shows without waiting (set while
 * a popup is open, and for the grace period after it closes).
 */
let warmUntil = 0;
const isWarm = () => Date.now() < warmUntil;

/**
 * One deck-tracker row: cost gem, name and copies left, over the card's `-DECK`
 * strip. Used by the /play deck panel and by the deck lab.
 * Its look is the `--dk-*` variables of whatever holds it (`deckRowVars`).
 * Resting the pointer on it for `hoverDelayMs` pops up the full
 * card, on the side of the row that has room: a row in the left half of the
 * window opens it to the right, one in the right half to the left.
 */
export const DeckRowView = ({
  row,
  card,
  hoverDelayMs = 600,
}: {
  row: DeckRow;
  card?: Card;
  hoverDelayMs?: number;
}) => {
  const [pos, setPos] = useState<{
    x: number;
    y: number;
    left: boolean;
    fresh: boolean;
  } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timer.current), []);
  // A row that goes away with its popup open (the card was drawn) must not
  // leave the shared state warm for good.
  const open = useRef(false);
  open.current = !!pos;
  useEffect(
    () => () => {
      if (open.current) warmUntil = Date.now() + WARM_GRACE_MS;
    },
    [],
  );
  const cardH = POPUP_WIDTH * 1.4;

  const show = (el: HTMLElement) => {
    const r = el.getBoundingClientRect(); // measured when it shows, so a scrolled panel is right
    const left = r.left + r.width / 2 > window.innerWidth / 2;
    const y = Math.max(
      8,
      Math.min(
        r.top + r.height / 2 - cardH / 2,
        window.innerHeight - cardH - 8,
      ),
    );
    const fresh = !isWarm(); // only the first popup fades in; rows crossed afterwards swap at once
    warmUntil = Infinity; // a popup is open: the next row shows at once
    setPos({
      x: left ? r.left - POPUP_GAP - POPUP_WIDTH : r.right + POPUP_GAP,
      y,
      left,
      fresh,
    });
  };

  return (
    <div
      className={cx(styles.deckRow, row.left === 0 ? styles.deckGone : '')}
      style={{ ['--deck-art' as string]: deckStripBackground(row.id) }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        clearTimeout(timer.current);
        if (isWarm()) show(el);
        else timer.current = setTimeout(() => show(el), hoverDelayMs);
      }}
      onMouseLeave={() => {
        clearTimeout(timer.current);
        if (pos) warmUntil = Date.now() + WARM_GRACE_MS;
        setPos(null);
      }}
    >
      <span className={styles.deckCost}>{row.cost}</span>
      <span className={styles.deckName}>{row.name}</span>
      <span className={styles.deckCount}>
        {row.total > 1 ? `${row.left}/${row.total}` : row.left}
      </span>
      {pos && card && typeof document !== 'undefined'
        ? createPortal(
            <div
              className={cx(
                styles.deckCardPopup,
                pos.fresh
                  ? pos.left
                    ? styles.deckPopupFromRight
                    : styles.deckPopupFromLeft
                  : '',
              )}
              style={{ left: pos.x, top: pos.y, width: POPUP_WIDTH }}
            >
              <CardFace card={card} width={POPUP_WIDTH} />
            </div>,
            document.body,
          )
        : null}
    </div>
  );
};
