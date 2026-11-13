import { useLayoutEffect, useRef } from 'react';
import type { Card } from '../../engine';
import { CardFace } from './CardFace';
import { FLIGHT_MS, flightFrames } from './motion';
import styles from './card-flight.module.scss';

interface CardFlightProps {
  card: Card;
  /** Where the card starts and where its minion will be (screen rectangles) */
  from: DOMRect;
  to: DOMRect;
  width: number;
}

/** A played minion's card, flying from the hand to its slot on the board and shrinking into it. Drawn above everything, input-proof. */
export const CardFlight = ({ card, from, to, width }: CardFlightProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  useLayoutEffect(() => {
    ref.current?.animate?.(flightFrames(from, to), { duration: FLIGHT_MS, fill: 'forwards' });
  }, [from, to]);
  return (
    <div
      ref={ref}
      className={styles.flight}
      style={{ left: from.left + from.width / 2 - width / 2, top: from.top + from.height / 2 - (width * 1.4) / 2, width }}
      aria-hidden="true"
    >
      <CardFace card={card} width={width} />
    </div>
  );
};
