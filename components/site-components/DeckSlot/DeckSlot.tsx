import Link from 'next/link';
import { Fragment } from 'react';
import { siteConfig } from '../../../app.config';

interface DeckSlotProps {
  filled: boolean;
  cardBack?: string;
}

export const DeckSlot = ({ filled, cardBack }: DeckSlotProps) => {
  return (
    <div className={['deck__slot'].join(' ')}>
      {filled ? (
        <div>!</div>
      ) : (
        <div>+</div>
      )}
    </div>
  );
};
