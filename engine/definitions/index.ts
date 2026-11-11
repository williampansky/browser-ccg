import type { Card } from '../cards/types';
import { CardDef, Definition, numbersOf } from './define-card';
import game001 from './game/game-001';
import core043 from './core/core-043';
import core044 from './core/core-044';
import core063 from './core/core-063';
import core065 from './core/core-065';
import core068 from './core/core-068';
import core074 from './core/core-074';
import core095 from './core/core-095';
import core096 from './core/core-096';
import core102 from './core/core-102';
import core107 from './core/core-107';
import core114 from './core/core-114';

/** Every card with behaviour beyond its stats and keywords. Vanilla cards have no entry. */
const all: Definition[] = [
  game001,
  core043,
  core044,
  core063,
  core065,
  core068,
  core074,
  core095,
  core096,
  core102,
  core107,
  core114,
];

const byId = new Map(all.map((d) => [d.id, d]));
if (byId.size !== all.length) throw new Error('duplicate card definition id');

/** The behaviour of a card, or undefined if it has none defined yet. */
export const getCardDef = (card: Card): CardDef | undefined =>
  byId.get(card.id)?.create(numbersOf(card.id, card.numbers));
