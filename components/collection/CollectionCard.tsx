import type { Card } from '../../engine';
import { CardFace } from '../play-board/CardFace';
import { useTilt } from '../card-detail/use-tilt';
import styles from './collection.module.scss';

/** One card in the collection grid: it tilts toward the pointer and a sheen follows it (the rest is CSS). */
export const CollectionCard = ({ card, width, onOpen }: { card: Card; width: number; onOpen: () => void }) => {
  const tilt = useTilt<HTMLButtonElement>(11);
  return (
    <button {...tilt} type="button" className={styles.card} onClick={onOpen} aria-label={`View ${card.name}`}>
      <CardFace card={card} width={width} />
    </button>
  );
};
