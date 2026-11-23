import React from 'react';
import type { Card } from '../../engine';
import { Button, Panel } from '../ui';
import { blankCard } from './blank-card';
import { CardFace } from './CardFace';
import styles from './play-board.module.scss';

/** One thing to pick: the card it is (drawn in full; a stand-in blank card when there is none), and a caption under it. */
export interface ChooseOption {
  /** The option's own card, if it has one */
  card?: Card;
  /** The name shown on the stand-in blank card when `card` is missing */
  label: string;
  /** Under the card: what picking it does ("with Guard", the option's text, ...) */
  caption?: string;
}

/** How wide a card is drawn before the lab's size knob (`lcmw`) scales it. */
export const CHOOSE_CARD_WIDTH = 190;

/**
 * The pick dialog: "choose one" cards, Surveying Drone and the Cleric's Resurrect. Each option is the real card, framed like one in hand, with a
 * caption under it. The look (card size, gap, backdrop, hover, caption) is the board lab's "Choose dialog" section, through `--choose-*` variables.
 * Clicking the backdrop or Cancel closes it.
 */
export const ChooseModal = ({
  title,
  options,
  onPick,
  onCancel,
}: {
  title: string;
  options: ChooseOption[];
  onPick: (index: number) => void;
  onCancel: () => void;
}) => (
  <div
    className={`${styles.modalBackdrop} ${styles.chooseBackdrop}`}
    data-ui-sfx
    onClick={onCancel}
  >
    <Panel className={styles.modal} onClick={(e) => e.stopPropagation()}>
      <h3 className={styles.chooseTitle}>{title}</h3>
      <div className={styles.chooseCards}>
        {options.map((o, i) => (
          <button
            key={i}
            type="button"
            className={styles.chooseOption}
            onClick={() => onPick(i)}
          >
            <span className={styles.chooseFace}>
              <CardFace
                card={o.card ?? blankCard(o.label)}
                width={CHOOSE_CARD_WIDTH}
                hideCost={!o.card}
              />
            </span>
            {o.caption && (
              <span className={styles.chooseCaption}>{o.caption}</span>
            )}
          </button>
        ))}
      </div>
      <Button onClick={onCancel}>Cancel</Button>
    </Panel>
  </div>
);
