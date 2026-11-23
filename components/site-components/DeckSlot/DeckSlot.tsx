import Link from 'next/link';
import { Fragment } from 'react';
import { siteConfig } from '../../../app.config';
import cx from '../../../utils/cx';

interface DeckSlotProps {
  filled: boolean;
  cardBack?: string;
}

export const DeckSlot = ({ filled = false, cardBack }: DeckSlotProps) => {
  return (
    <div className={cx('deck__slot')}>
      {filled ? <div>!</div> : <div>+</div>}
    </div>
  );
};
