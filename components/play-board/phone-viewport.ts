/** What a phone needs from the viewport tag on the board screens. */
export type PhoneScreen = {
  /** The short side of the physical screen, in CSS pixels. */
  shortSide: number;
  /**
   * Width over height of the visible window (address bar already taken out),
   * which is the same at any page scale.
   */
  aspect: number;
  isPortrait: boolean;
};

/** A screen whose short side is under this is a phone, not a tablet. */
export const PHONE_MAX_SHORT_SIDE = 700;
/** The board is laid out for a window about this tall (desktop CSS pixels). */
export const BOARD_DESIGN_HEIGHT = 760;
/** Narrower than this and the log and deck list would be hidden. */
export const BOARD_MIN_WIDTH = 1200;
export const BOARD_MAX_WIDTH = 2400;
export const NORMAL_VIEWPORT =
  'initial-scale=1.0, width=device-width, viewport-fit=cover';

export const isPhone = (screen: PhoneScreen): boolean =>
  screen.shortSide < PHONE_MAX_SHORT_SIDE;

/**
 * The viewport tag content for a board screen. In landscape on a phone the
 * page is laid out as a desktop-sized window of the visible window's shape and
 * the browser scales it down to fit, so the board's pixel layout, drag maths
 * and effects layer all work unchanged. There is no initial-scale on purpose:
 * it would pin the page at 1:1 and crop it. `viewport-fit=cover` lets an
 * installed app draw under the status bar and cutout instead of leaving blank
 * strips. In portrait (where a rotate prompt shows) and on anything bigger it
 * is the normal tag.
 */
export const boardViewportContent = (screen: PhoneScreen): string => {
  if (!isPhone(screen) || screen.isPortrait) return NORMAL_VIEWPORT;
  const wanted = Math.round(BOARD_DESIGN_HEIGHT * screen.aspect);
  const width = Math.min(BOARD_MAX_WIDTH, Math.max(BOARD_MIN_WIDTH, wanted));

  return `width=${width}, user-scalable=no, viewport-fit=cover`;
};
