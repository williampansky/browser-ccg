import { CardFace } from '../play-board/CardFace';
import styles from '../deck-builder/deck-builder.module.scss';
import type { Card } from '../../engine';

/**
 * The card's keywords and effects, each with the glossary's explanation.
 * Nothing is drawn for a card with none.
 */
export const CardTokens = ({ tokens = [] }: { tokens?: Card[] }) => {
  return (
    <div className={styles.tokens}>
      <h3>Makes or offers</h3>
      <div className={styles.tokenRow}>
        {tokens?.map(t => (
          <div key={t.id} className={styles.token}>
            <CardFace card={t} width={110} />
            <span>{t.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
