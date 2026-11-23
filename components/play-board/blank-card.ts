import type { Card } from '../../engine';

/**
 * A stand-in card for a choice that has no card of its own: the NONE rarity
 * (the plain steel frame, no gem) with the placeholder art, named
 * for the choice. Draw it with `hideCost`, since it costs nothing and the
 * number would only mislead.
 */
export const blankCard = (name: string, text = ''): Card => ({
  id: 'BLANK_CHOICE',
  source: 'entourage',
  name,
  type: 'spell',
  cost: 0,
  rarity: 'NONE',
  set: 'NONE',
  mechanics: [],
  numbers: {},
  textTemplate: text,
  text,
  richText: text,
  entourage: [],
  isToken: true,
  elite: false,
  active: true,
  collectible: false,
});
