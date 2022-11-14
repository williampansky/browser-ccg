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
  const getRevealText = (): string => {
    // if (turn === 1 && zoneNumber === 1) return '1 turn';
    if (turn === 1 && zoneNumber === 2) return '2 turns';
    else if (turn === 2 && zoneNumber === 2) return '1 turn';
    return '1 turn';
  };

  return (
    <div
      className={[
        styles['component'],
        isRevealed ? styles['revealed'] : '',
      ].join(' ')}
    >
      <div>Reveals in</div>
      <div>{getRevealText()}</div>
    </div>
  );
};
