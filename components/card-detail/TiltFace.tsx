import type { Card } from '../../engine';
import { CardFace } from '../play-board/CardFace';
import { useTilt } from './use-tilt';
import styles from './tilt-face.module.scss';

/** The enlarged card in a detail window: it tilts toward the pointer and a sheen follows it. */
export const TiltFace = ({ card, width }: { card: Card; width: number }) => {
  const tilt = useTilt<HTMLDivElement>(9);
  return (
    <div {...tilt} className={styles.tilt}>
      <CardFace card={card} width={width} />
    </div>
  );
};
