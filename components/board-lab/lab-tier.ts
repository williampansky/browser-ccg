import {
  LAYOUT_TIERS,
  layoutForTier,
  type LayoutTier,
} from '../play-board/layout-css';

let labTier: LayoutTier = 'large';

/**
 * Which screen size the lab is editing (the `dev` URL param). The page sets it
 * while rendering, before its panels read the saved values.
 */
export const setLabTier = (
  value: string | string[] | undefined,
): LayoutTier => {
  const text = Array.isArray(value) ? value[0] : value;
  const found = LAYOUT_TIERS.find((tier) => tier === text);
  labTier = found ?? 'large';

  return labTier;
};

export const getLabTier = (): LayoutTier => labTier;

/** The saved knobs for the tier being edited (what /play uses at that size). */
export const labLayout = (): Record<string, string> => layoutForTier(labTier);
