import type { Card } from '../cards/types';
import { CardDef, Definition, numbersOf } from './define-card';
import game001 from './game/game-001';
import core043 from './core/core-043';
import core044 from './core/core-044';
import core063 from './core/core-063';
import core065 from './core/core-065';
import core095 from './core/core-095';
import core102 from './core/core-102';

/** Every card with behaviour beyond its stats and keywords. Vanilla cards have no entry. */
const all: Definition[] = [game001, core043, core044, core063, core065, core095, core102];

const byId = new Map(all.map((d) => [d.id, d]));
if (byId.size !== all.length) throw new Error('duplicate card definition id');

/** The behaviour of a card, or undefined if it has none defined yet. */
export const getCardDef = (card: Card): CardDef | undefined =>
  byId.get(card.id)?.create(numbersOf(card.id, card.numbers));
