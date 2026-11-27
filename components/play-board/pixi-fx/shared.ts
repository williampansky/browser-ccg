/** How far from a picture's centre its point is, as a fraction of its width. */
export const SPRITE_REACH = 0.7;

/** How far a spinning picture has turned after `elapsedMs`, in radians. */
export const spinRadians = (
  degreesPerSecond: number,
  elapsedMs: number,
): number => (degreesPerSecond * (elapsedMs / 1000) * Math.PI) / 180;
