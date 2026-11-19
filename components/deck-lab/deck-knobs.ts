import type { DeckTune } from '../play-board/deck-row-tune';

type NumKey = { [K in keyof DeckTune]: DeckTune[K] extends number ? K : never }[keyof DeckTune];
type FlagKey = { [K in keyof DeckTune]: DeckTune[K] extends boolean ? K : never }[keyof DeckTune];
type ColourKey = { [K in keyof DeckTune]: DeckTune[K] extends string ? K : never }[keyof DeckTune];

export interface DeckKnob {
  field: NumKey;
  label: string;
  min: number;
  max: number;
  step?: number;
}

/** The deck lab's sliders, by section. Each lives in the URL as `d_<field>`. */
export const DECK_GROUPS: { title: string; open?: boolean; knobs: DeckKnob[]; flags?: { field: FlagKey; label: string }[]; colours?: { field: ColourKey; label: string }[] }[] = [
  {
    title: 'The -DECK strip',
    open: true,
    flags: [{ field: 'showArt', label: 'Show the strip' }],
    knobs: [
      { field: 'artZoom', label: 'Zoom (100 = just covers the row)', min: 100, max: 400 },
      { field: 'artX', label: 'Centre: across (%)', min: 0, max: 100 },
      { field: 'artY', label: 'Centre: down (%)', min: 0, max: 100 },
      { field: 'artOpacity', label: 'Opacity (%)', min: 0, max: 100 },
      { field: 'artBright', label: 'Brightness (%)', min: 0, max: 200 },
      { field: 'artSat', label: 'Saturation (%)', min: 0, max: 200 },
      { field: 'artBlur', label: 'Blur (px)', min: 0, max: 12, step: 0.5 },
    ],
  },
  {
    title: 'Shade over the strip',
    open: true,
    colours: [{ field: 'shadeColour', label: 'Shade colour' }],
    knobs: [
      { field: 'shadeLeft', label: 'Strength at the left (%)', min: 0, max: 100 },
      { field: 'shadeRight', label: 'Strength at the right (%)', min: 0, max: 100 },
      { field: 'shadeStop', label: 'Changes over this much of the row (%)', min: 5, max: 100 },
      { field: 'hoverShade', label: 'Under the pointer: shade left (%)', min: 0, max: 100 },
    ],
  },
  {
    title: 'Row',
    knobs: [
      { field: 'hoverDelay', label: 'Hover time before the full card pops up (ms)', min: 0, max: 3000, step: 50 },
      { field: 'rowH', label: 'Height (px)', min: 16, max: 80 },
      { field: 'rowGap', label: 'Gap between rows (px)', min: 0, max: 16 },
      { field: 'radius', label: 'Corner radius (px)', min: 0, max: 20 },
      { field: 'accentW', label: 'Left accent bar (px)', min: 0, max: 12 },
      { field: 'padL', label: 'Padding left (px)', min: 0, max: 30 },
      { field: 'padR', label: 'Padding right (px)', min: 0, max: 30 },
      { field: 'itemGap', label: 'Gap between cost, name and count (px)', min: 0, max: 30 },
    ],
    colours: [
      { field: 'rowColour', label: 'Row colour (behind the strip)' },
      { field: 'accentColour', label: 'Accent bar colour' },
    ],
  },
  {
    title: 'Cost gem',
    flags: [{ field: 'costShow', label: 'Show the cost gem' }],
    knobs: [
      { field: 'costSize', label: 'Size (px)', min: 8, max: 48 },
      { field: 'costFont', label: 'Number size (px)', min: 6, max: 30 },
    ],
    colours: [{ field: 'costColour', label: 'Gem colour' }],
  },
  {
    title: 'Name and count',
    knobs: [
      { field: 'nameFont', label: 'Name size (px)', min: 8, max: 28 },
      { field: 'nameWeight', label: 'Name weight', min: 100, max: 900, step: 100 },
      { field: 'nameShadow', label: 'Name shadow (px, 0 = none)', min: 0, max: 12, step: 0.5 },
      { field: 'countFont', label: 'Count size (px)', min: 8, max: 28 },
    ],
    colours: [
      { field: 'nameColour', label: 'Name colour' },
      { field: 'countColour', label: 'Count colour' },
    ],
  },
  {
    title: 'A card with none left',
    knobs: [
      { field: 'goneOpacity', label: 'Opacity (%)', min: 0, max: 100 },
      { field: 'goneGrey', label: 'Greyness (%)', min: 0, max: 100 },
    ],
  },
];
