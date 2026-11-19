import React from 'react';
import cx from '../../utils/cx';
import { deckStripBackground } from './card-face-model';
import type { DeckRow } from './deck-rows';
import styles from './play-board.module.scss';

/**
 * One deck-tracker row: cost gem, name and copies left, over the card's `-DECK` strip. Used by the /play deck panel (which adds a tooltip through
 * `handlers` and `children`) and by the deck lab. Its look is the `--dk-*` variables of whatever holds it (`deckRowVars`).
 */
export const DeckRowView = ({ row, handlers, children }: { row: DeckRow; handlers?: React.HTMLAttributes<HTMLDivElement>; children?: React.ReactNode }) => (
  <div
    className={cx(styles.deckRow, row.left === 0 ? styles.deckGone : '')}
    style={{ ['--deck-art' as string]: deckStripBackground(row.id) }}
    {...handlers}
  >
    <span className={styles.deckCost}>{row.cost}</span>
    <span className={styles.deckName}>{row.name}</span>
    <span className={styles.deckCount}>{row.total > 1 ? `${row.left}/${row.total}` : row.left}</span>
    {children}
  </div>
);
