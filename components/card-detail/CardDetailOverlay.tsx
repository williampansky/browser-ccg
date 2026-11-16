import { CardEffects } from './CardEffects';
import { CardTokens } from './CardTokens';
import { createPortal } from 'react-dom';
import { TiltFace } from './TiltFace';
import { useDetailCardWidth } from './detail-card-width';
import { useEffect, useState } from 'react';

import type { Card } from '../../engine';

// The overlay's look is shared with the collection and the deck builder.
import styles from '../deck-builder/deck-builder.module.scss';
import { ArtistCredit } from './ArtistCredit';

/**
 * The enlarged-card window: the tilting card, its text and effects, the flavour
 * line (left out when a card has none), its rules note, and the
 * tokens (ENTOURAGE) it makes.
 *
 * Click anywhere or press Esc to close. Used by the collection and by
 * right-clicking a minion on the board.
 *
 * Drawn into <body> so no parent's stacking context can cover it.
 */
export const CardDetailOverlay = ({
  card,
  byId,
  onClose
}: {
  card: Card;
  byId: Map<string, Card>;
  onClose: () => void;
}) => {
  const [copied, setCopied] = useState<string | null>(null);
  const bigWidth = useDetailCardWidth();

  /**
   * The tokens (ENTOURAGE) this card makes. Filter out any that are missing
   * from the byId map, which can happen if a token is in a set that isn't loaded.
   */
  const tokens = card.entourage
    .map(id => byId.get(id))
    .filter((t): t is Card => !!t);

  /**
   * Copy the card's ID to the clipboard. The overlay is closed by clicking
   * anywhere, so we don't close it here. Instead, we show a temporary "Copied!"
   * message in place of the ID.
   */
  const onCardIdClick = (e: React.MouseEvent) => {
    // a click anywhere else closes the dialog; this one only copies
    e.stopPropagation();

    navigator.clipboard?.writeText(card.id).then(() => {
      setCopied(card.id);
      window.setTimeout(
        () => setCopied(id => (id === card.id ? null : id)),
        1200
      );
    });
  };

  // Close the overlay when the user presses Esc. The overlay is closed by
  // clicking anywhere, so we don't need to handle Enter or Space.
  useEffect(() => {
    const key = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [onClose]);

  /**
   * The overlay's view, drawn into <body>
   * so no parent's stacking context can cover it.
   */
  const view = (
    <div className={styles.backdrop} onClick={() => onClose()}>
      <div className={styles.detail} role="dialog" aria-label={card.name}>
        <div className={styles.detailMain}>
          <TiltFace card={card} width={bigWidth} />
          <div className={styles.detailText}>
            <h1>{card.name}</h1>

            <p className={styles.detailMeta}>
              {card.source === 'prime' ? 'Prime' : 'Core'} ·{' '}
              <span className={styles.cap}>{card.type}</span>
            </p>

            <button
              type="button"
              className={styles.cardId}
              title="Click to copy"
              onClick={onCardIdClick}
            >
              {copied === card.id ? 'Copied!' : card.id}
            </button>

            {card.flavor && (
              <blockquote className={styles.flavor}>{card.flavor}</blockquote>
            )}

            {card?.mechanics?.length !== 0 && <CardEffects card={card} />}

            {card.designNote && (
              <section className={styles.rulesNote} aria-label="Rules note">
                <h3>Rules note</h3>
                <p>{card.designNote}</p>
              </section>
            )}

            {tokens?.length !== 0 && <CardTokens tokens={tokens} />}

            <p className={styles.closeHint}>
              Click anywhere or press Esc to close
            </p>

            {card.artistName && (
              <ArtistCredit
                artistName={card.artistName}
                artistUrl={card.artistUrl}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document === 'undefined'
    ? null
    : createPortal(view, document.body);
};
