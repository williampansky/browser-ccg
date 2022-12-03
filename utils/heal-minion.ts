import { add } from 'mathjs';
import type { Card } from '../types';
import limitNumberWithinRange from './limit-number-within-range';
import pushHealthStreamAndSetDisplay from './push-healthstream-and-set-display';

export default function healMinion(cardToHeal: Card, cardToBlame: Card) {
  pushHealthStreamAndSetDisplay(
    cardToHeal,
    cardToBlame,
    cardToBlame.numberPrimary,
    limitNumberWithinRange(
      add(cardToHeal.displayHealth, cardToBlame.numberPrimary),
      cardToHeal.baseHealth,
      cardToBlame.numberPrimary
    )
  );
}
