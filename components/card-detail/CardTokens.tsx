import { CardFace } from '../play-board/CardFace';
import styles from '../deck-builder/deck-builder.module.scss';
import type { Card } from '../../engine';

/**
 * A row of related cards under the card's text, each with its name: the entourage cards a card makes or offers, or (when the card is itself an
 * entourage card) the cards that make it. With `onPick`, each one can be clicked to view it instead.
 */
export const CardTokens = ({
  tokens = [],
  heading = 'Makes or offers',
  onPick
}: {
  tokens?: Card[];
  heading?: string;
  onPick?: (card: Card) => void;
}) => {
  return (
    <div className={styles.tokens}>
      <h3>{heading}</h3>
      <div className={styles.tokenRow}>
        {tokens?.map(t => {
          const face = (
            <>
              <CardFace card={t} width={110} />
              <span>{t.name}</span>
            </>
          );
          return onPick ? (
            <button
              key={t.id}
              type="button"
              className={`${styles.token} ${styles.tokenPick}`}
              title={`View ${t.name}`}
              onClick={e => {
                e.stopPropagation(); // a click elsewhere closes the overlay; this one swaps the card
                onPick(t);
              }}
            >
              {face}
            </button>
          ) : (
            <div key={t.id} className={styles.token}>
              {face}
            </div>
          );
        })}
      </div>
    </div>
  );
};
