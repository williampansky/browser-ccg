/**
 * Pictures a travel effect can fly instead of the glowing orb (the `travelHasSprite` option).
 * Each is a transparent PNG in `public/images/fx/sprites/<id>.png`, cut from
 * the author's icon packs and drawn so the blade points diagonally; `tip` is
 * the direction of its point in degrees on screen (0 = right, -90 = up, 90 =
 * down), which the effect turns toward the target.
 */
export interface SpellFxSprite {
  id: string;
  label: string;
  /** Where the point faces in the picture, in degrees on screen */
  tip: number;
}

/** The blades drawn pointing to the upper right. */
const UP_RIGHT = -45;
/** A blade drawn pointing to the lower left. */
const DOWN_LEFT = 135;

export const SPELL_FX_SPRITES: SpellFxSprite[] = [
  { id: 'dagger-green', label: 'Green dagger', tip: UP_RIGHT },
  { id: 'dagger-purple', label: 'Purple dagger', tip: UP_RIGHT },
  { id: 'dagger-cyan', label: 'Cyan curved dagger', tip: UP_RIGHT },
  { id: 'dagger-pale', label: 'Pale curved dagger', tip: UP_RIGHT },
  { id: 'dagger-orange', label: 'Orange dagger', tip: UP_RIGHT },
  { id: 'dagger-bone', label: 'Bone dagger', tip: DOWN_LEFT },
  { id: 'axe-skull', label: 'Skull battle axe', tip: -100 },
  { id: 'axe-double', label: 'Double axe', tip: -90 },
  { id: 'spear-purple', label: 'Purple spear', tip: -45 },
  { id: 'dagger-curved', label: 'Curved brown dagger', tip: -45 },
  { id: 'hammer-war', label: 'Blue war hammer', tip: -45 },
  { id: 'mace-star', label: 'Morning star', tip: -45 },
  { id: 'shard-blue', label: 'Blue crystal shard', tip: -45 },
  { id: 'shard-ice', label: 'Ice shard', tip: -45 },
  { id: 'potion-red', label: 'Red potion', tip: -90 },
  { id: 'potion-green', label: 'Green potion', tip: -90 },
  { id: 'potion-purple', label: 'Purple potion', tip: -90 },
  { id: 'skull-beast', label: 'Beast skull', tip: 180 },
  { id: 'shield-kite', label: 'Blue kite shield', tip: 90 },
  { id: 'shield-round', label: 'Round wooden shield', tip: -90 },
  { id: 'mind-circle', label: 'mind circle icon', tip: -45 },
];

/** The picture with this id (the first one if it is not known). */
export const spriteById = (id: string): SpellFxSprite =>
  SPELL_FX_SPRITES.find((sprite) => sprite.id === id) ?? SPELL_FX_SPRITES[0];

/** Where a sprite's PNG is served from. */
export const spriteUrl = (id: string): string => `/images/fx/sprites/${id}.png`;
