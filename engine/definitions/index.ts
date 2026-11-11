import type { Card } from '../cards/types';
import { CardDef, Definition, numbersOf } from './define-card';
import game001 from './game/game-001';
import core001 from './core/core-001';
import core012 from './core/core-012';
import core013 from './core/core-013';
import core021 from './core/core-021';
import core035 from './core/core-035';
import core061 from './core/core-061';
import core071 from './core/core-071';
import core085 from './core/core-085';
import core043 from './core/core-043';
import core044 from './core/core-044';
import core063 from './core/core-063';
import core065 from './core/core-065';
import core068 from './core/core-068';
import core074 from './core/core-074';
import core094 from './core/core-094';
import core095 from './core/core-095';
import core096 from './core/core-096';
import core102 from './core/core-102';
import core107 from './core/core-107';
import core114 from './core/core-114';
import core129 from './core/core-129';

/** Every card with behaviour beyond its stats and keywords. Vanilla cards have no entry. */
const all: Definition[] = [
  game001,
  core001,
  core012,
  core013,
  core021,
  core035,
  core061,
  core071,
  core085,
  core043,
  core044,
  core063,
  core065,
  core068,
  core074,
  core094,
  core095,
  core096,
  core102,
  core107,
  core114,
  core129,
];

const byId = new Map(all.map((d) => [d.id, d]));
if (byId.size !== all.length) throw new Error('duplicate card definition id');

/** The behaviour of a card, or undefined if it has none defined yet. */
export const getCardDef = (card: Card): CardDef | undefined =>
  byId.get(card.id)?.create(numbersOf(card.id, card.numbers));
