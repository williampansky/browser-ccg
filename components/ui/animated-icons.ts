/**
 * The animated shape icons (crosses, plus signs, dots, a cross turning into a check): white-on-transparent PNG frame sequences in
 * `public/images/ui/animated/<id>/<NNN>.png` (96 px, frames numbered from 000). Drawn through a mask, so they take the text colour of
 * wherever they sit, and a theme can tint them. Frames of an icon load the first time it plays (see `AnimatedIcon`).
 */
export interface AnimatedIconDef {
  id: string;
  label: string;
  frames: number;
}

export const ANIMATED_ICONS: AnimatedIconDef[] = [
  { id: 'cross-into-checkmark', label: 'Cross into checkmark', frames: 51 },
  { id: 'dots-circle-2', label: 'Dots Circle 2', frames: 80 },
  { id: 'dots-circle', label: 'Dots Circle', frames: 130 },
  { id: 'parallel-dots-2', label: 'Parallel Dots 2', frames: 125 },
  { id: 'parallel-dots', label: 'Parallel Dots', frames: 20 },
  { id: 'regular-cross-point-corner', label: 'Regular Cross Point Corner', frames: 35 },
  { id: 'regular-cross-rounded-corner-2', label: 'Regular Cross Rounded Corner 2', frames: 53 },
  { id: 'regular-cross-rounded-corner', label: 'Regular Cross Rounded Corner', frames: 26 },
  { id: 'regular-cross', label: 'Regular Cross', frames: 30 },
  { id: 'regular-plus-sign-point-corner', label: 'Regular Plus Sign Point Corner', frames: 35 },
  { id: 'regular-plus-sign-rounded-corner-2', label: 'Regular Plus Sign Rounded Corner 2', frames: 54 },
  { id: 'regular-plus-sign-rounded-corner', label: 'Regular Plus Sign Rounded Corner', frames: 26 },
  { id: 'regular-plus-sign', label: 'Regular Plus Sign', frames: 30 },
  { id: 'regular-thick-plus-sign', label: 'Regular Thick Plus Sign', frames: 31 },
  { id: 'thick-cross-2', label: 'Thick Cross 2', frames: 25 },
  { id: 'thick-cross-point-corner-2', label: 'Thick Cross Point Corner 2', frames: 14 },
  { id: 'thick-cross-point-corner', label: 'Thick Cross Point Corner', frames: 20 },
  { id: 'thick-cross', label: 'Thick Cross', frames: 31 },
  { id: 'thick-plus-sign-point-corner-2', label: 'Thick Plus Sign Point Corner 2', frames: 20 },
  { id: 'thick-plus-sign-point-corner', label: 'Thick Plus Sign Point Corner', frames: 15 },
  { id: 'thick-plus-sign-rounded-corner', label: 'Thick Plus Sign Rounded Corner', frames: 91 },
  { id: 'thick-plus-sign', label: 'Thick Plus Sign', frames: 25 },
];

export const FRAME_RATE = 30;

export const animatedIconOf = (id: string): AnimatedIconDef | undefined => ANIMATED_ICONS.find((i) => i.id === id);

export const frameUrl = (id: string, frame: number): string => `/images/ui/animated/${id}/${String(frame).padStart(3, '0')}.png`;
