/**
 * How a deck-tracker row (`.deckRow` in play-board.module.scss, the `-DECK` strip behind the name) looks. `DECK_DEFAULTS` is the saved look;
 * the deck lab (`/deck-lab`) edits it live through `d_<field>` URL params and `npm run deck` bakes a lab URL into it. `/play` reads the same
 * params over the defaults (`parseDeckTune`), so a lab URL's setup carries over. The values reach the CSS as `--dk-*` variables (`deckRowVars`).
 */
export interface DeckTune {
  /** Draw the `-DECK` strip behind each row */
  showArt: boolean;
  /** Row: height, gap between rows, corner radius, left accent bar width (px), padding left / right, gap between the row's items */
  rowH: number;
  rowGap: number;
  radius: number;
  accentW: number;
  padL: number;
  padR: number;
  itemGap: number;
  /** The strip: zoom (100 = just covers the row), where it is centred (% across / down), opacity, brightness, saturation (%), blur (px) */
  artZoom: number;
  artX: number;
  artY: number;
  artOpacity: number;
  artBright: number;
  artSat: number;
  artBlur: number;
  /** A shade over the strip so the name reads: its opacity at the left edge and at the right edge (%), and how far across (%) it has changed by */
  shadeLeft: number;
  shadeRight: number;
  shadeStop: number;
  /** How much of the shade is left while the pointer is on the row (%, 100 = no change) */
  hoverShade: number;
  /** Cost gem: shown, diameter and number size (px) */
  costShow: boolean;
  costSize: number;
  costFont: number;
  /** Name and count text (px) and name shadow strength (px of glow, 0 = none) */
  nameFont: number;
  nameWeight: number;
  nameShadow: number;
  countFont: number;
  /** A card with no copies left: opacity and how grey it goes (%) */
  goneOpacity: number;
  goneGrey: number;
  /** Colours as 6-digit hex without the # */
  rowColour: string;
  accentColour: string;
  shadeColour: string;
  costColour: string;
  nameColour: string;
  countColour: string;
}

export const DECK_DEFAULTS: DeckTune = {
  showArt: true,
  rowH: 30,
  rowGap: 2,
  radius: 4,
  accentW: 3,
  padL: 4,
  padR: 8,
  itemGap: 8,
  artZoom: 100,
  artX: 50,
  artY: 50,
  artOpacity: 100,
  artBright: 100,
  artSat: 100,
  artBlur: 0,
  shadeLeft: 85,
  shadeRight: 10,
  shadeStop: 70,
  hoverShade: 60,
  costShow: true,
  costSize: 21,
  costFont: 12,
  nameFont: 14,
  nameWeight: 600,
  nameShadow: 3,
  countFont: 13,
  goneOpacity: 35,
  goneGrey: 60,
  rowColour: '232734',
  accentColour: '3b6fd4',
  shadeColour: '0b0d14',
  costColour: '3b6fd4',
  nameColour: 'e8e8ee',
  countColour: 'e8e8ee',
};

/** The deck look from a URL query string: `d_<field>` params over DECK_DEFAULTS. Numbers, 6-digit hex colours and `1` / `0` flags; anything else is ignored. */
export const parseDeckTune = (search: string): DeckTune => {
  const params = new URLSearchParams(search);
  const tune: Record<string, number | string | boolean> = { ...DECK_DEFAULTS };
  (Object.keys(DECK_DEFAULTS) as (keyof DeckTune)[]).forEach((field) => {
    const raw = params.get(`d_${field}`);
    if (raw === null) return;
    const base = DECK_DEFAULTS[field];
    if (typeof base === 'boolean') {
      if (raw === '0' || raw === '1') tune[field] = raw === '1';
    } else if (typeof base === 'string') {
      if (/^[0-9a-f]{6}$/i.test(raw)) tune[field] = raw.toLowerCase();
    } else if (raw !== '' && !Number.isNaN(+raw)) {
      tune[field] = +raw;
    }
  });
  return tune as unknown as DeckTune;
};

/** The CSS variables the deck rows read (set on the element that holds the rows). */
export const deckRowVars = (t: DeckTune): Record<string, string> => ({
  '--dk-h': `${t.rowH}px`,
  '--dk-row-gap': `${t.rowGap}px`,
  '--dk-r': `${t.radius}px`,
  '--dk-accent-w': `${t.accentW}px`,
  '--dk-pl': `${t.padL}px`,
  '--dk-pr': `${t.padR}px`,
  '--dk-gap': `${t.itemGap}px`,
  '--dk-art-on': t.showArt ? '1' : '0',
  '--dk-zoom': String(t.artZoom / 100),
  '--dk-ax': `${t.artX}%`,
  '--dk-ay': `${t.artY}%`,
  '--dk-art-o': String(t.artOpacity / 100),
  '--dk-art-b': String(t.artBright / 100),
  '--dk-art-s': String(t.artSat / 100),
  '--dk-art-blur': `${t.artBlur}px`,
  '--dk-sl': `${t.shadeLeft}%`,
  '--dk-sr': `${t.shadeRight}%`,
  '--dk-ss': `${t.shadeStop}%`,
  '--dk-hover': String(t.hoverShade / 100),
  '--dk-cost-display': t.costShow ? 'block' : 'none',
  '--dk-cost-d': `${t.costSize}px`,
  '--dk-cost-f': `${t.costFont}px`,
  '--dk-name-f': `${t.nameFont}px`,
  '--dk-name-w': String(t.nameWeight),
  '--dk-name-sh': `${t.nameShadow}px`,
  '--dk-count-f': `${t.countFont}px`,
  '--dk-gone-o': String(t.goneOpacity / 100),
  '--dk-gone-g': String(t.goneGrey / 100),
  '--dk-bg': `#${t.rowColour}`,
  '--dk-accent': `#${t.accentColour}`,
  '--dk-shade': `#${t.shadeColour}`,
  '--dk-cost-c': `#${t.costColour}`,
  '--dk-name-c': `#${t.nameColour}`,
  '--dk-count-c': `#${t.countColour}`,
});
