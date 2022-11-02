import type { ReactElement } from 'react';
import styles from './zone-reveal-overlay.module.scss';

interface ZoneRevealOverlay {
  isRevealed: boolean;
  turn: number;
  zoneNumber: number;
}

export const ZoneRevealOverlay = ({
  isRevealed,
  turn,
  zoneNumber,
}: ZoneRevealOverlay): ReactElement => {
  return (
    <div className={[styles['component'], isRevealed ? styles['revealed'] : ''].join(' ')}>
      <div>Reveals in</div>
      <div>{turn === 1 && zoneNumber === 1 ? '1 turn' : '2 turns'}</div>
    </div>
  );
};
