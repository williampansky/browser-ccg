import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Card } from '../../engine';
import { CardFace } from '../play-board/CardFace';
// The overlay's look is shared with the collection and the deck builder.
import styles from '../deck-builder/deck-builder.module.scss';
import { CardEffects } from './CardEffects';
import { TiltFace } from './TiltFace';
import { useDetailCardWidth } from './detail-card-width';

/**
 * The enlarged-card window: the tilting card, its text and effects, the flavour line, and the tokens it makes. Click anywhere or press Esc
 * to close. Used by the collection and by right-clicking a minion on the board. Drawn into <body> so no parent's stacking context can cover it.
 */
export const CardDetailOverlay = ({ card, byId, onClose }: { card: Card; byId: Map<string, Card>; onClose: () => void }) => {
  const [copied, setCopied] = useState<string | null>(null);
  const bigWidth = useDetailCardWidth();
  const tokens = card.entourage.map((id) => byId.get(id)).filter((t): t is Card => !!t);
  useEffect(() => {
    const key = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [onClose]);
  const view = (
  <div className={styles.backdrop} onClick={() => onClose()}>
    <div className={styles.detail} role="dialog" aria-label={card.name}>
      <div className={styles.detailMain}>
        <TiltFace card={card} width={bigWidth} />
        <div className={styles.detailText}>
          <h2>{card.name}</h2>
          <p className={styles.detailMeta}>
            {card.source === 'prime' ? 'Prime' : 'Core'} · <span className={styles.cap}>{card.type}</span>
          </p>
          <button
            type="button"
            className={styles.cardId}
            title="Click to copy"
            onClick={(e) => {
              e.stopPropagation(); // a click anywhere else closes the dialog; this one only copies
              navigator.clipboard?.writeText(card.id).then(() => {
                setCopied(card.id);
                window.setTimeout(() => setCopied((id) => (id === card.id ? null : id)), 1200);
              });
            }}
          >
            {copied === card.id ? 'Copied!' : card.id}
          </button>
          {card.flavor ? <blockquote className={styles.flavor}>{card.flavor}</blockquote> : <p className={styles.noFlavor}>No flavor text.</p>}
          <CardEffects card={card} />
  
          {tokens.length > 0 && (
            <div className={styles.tokens}>
              <h3>Makes or offers</h3>
              <div className={styles.tokenRow}>
                {tokens.map((t) => (
                  <div key={t.id} className={styles.token}>
                    <CardFace card={t} width={110} />
                    <span>{t.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <p className={styles.closeHint}>Click anywhere or press Esc to close</p>
        </div>
      </div>
    </div>
  </div>
  );
  return typeof document === 'undefined' ? null : createPortal(view, document.body);
};
