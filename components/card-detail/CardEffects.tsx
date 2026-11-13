import { effectsOf } from '../../engine';
import type { Card } from '../../engine';
import styles from '../deck-builder/deck-builder.module.scss';

/** The card's keywords and effects, each with the glossary's explanation. Nothing is drawn for a card with none. */
export const CardEffects = ({ card }: { card: Card }) => {
  const effects = effectsOf(card);
  if (!effects.length) return null;
  return (
    <section className={styles.effects} aria-label="Effects">
      <h3>Effects</h3>
      <ul>
        {effects.map((e) => (
          <li key={e.symbol}>
            <strong>{e.name}</strong>
            <span>{e.description}</span>
          </li>
        ))}
      </ul>
    </section>
  );
};
