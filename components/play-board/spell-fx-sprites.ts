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
];

/** The picture with this id (the first one if it is not known). */
export const spriteById = (id: string): SpellFxSprite =>
  SPELL_FX_SPRITES.find((sprite) => sprite.id === id) ?? SPELL_FX_SPRITES[0];

/** Where a sprite's PNG is served from. */
export const spriteUrl = (id: string): string => `/images/fx/sprites/${id}.png`;
