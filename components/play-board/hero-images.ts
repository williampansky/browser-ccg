import type { SyntheticEvent } from 'react';
import { PLACEHOLDER_ART } from './card-face-model';

/**
 * Hero art under `public/images/heroes/<CLASS>/` (`FIGHTER`, `WIZARD`, ...): the
 * portrait (`avatar`) and the skill icons (`skill-1` ..), as `.jpg` or `.png`.
 * A missing file shows the placeholder (see `heroArtLayers` and
 * `heroArtFallback`).
 */
const JPG = /\.jpg$/;

/** The `.jpg` path; `heroArtLayers` and `heroArtFallback` also try `.png`. */
export const heroImage = (
  heroId: string,
  name: 'avatar' | 'skill-1' | 'skill-2' | 'skill-3' | string,
): string => `/images/heroes/${heroId}/${name}.jpg`;

const asPng = (url: string): string => url.replace(JPG, '.png');

/** Layers for one art file: `.jpg`, then `.png`. */
const fileLayers = (url: string): string[] => [url, asPng(url)];

/**
 * CSS `background-image` for hero art: the `.jpg`, the `.png`, then the
 * placeholder.
 */
export const heroArtLayers = (heroId: string, name: string): string =>
  [...fileLayers(heroImage(heroId, name)), PLACEHOLDER_ART]
    .map((url) => `url(${url})`)
    .join(', ');

/**
 * `onError` for a hero `<img>` whose file is missing (a 404): a `.jpg` that is
 * not there is retried as `.png`, then the placeholder.
 */
export const heroArtFallback = (
  event: SyntheticEvent<HTMLImageElement>,
): void => {
  const image = event.currentTarget;

  if (JPG.test(image.src)) image.src = asPng(image.src);
  else if (!image.src.endsWith(PLACEHOLDER_ART)) image.src = PLACEHOLDER_ART;
};

/**
 * `ref` for a hero `<img>` that is also rendered on the server: its 404 can
 * happen before React attaches `onError`, so a file that already failed is
 * retried when the image mounts.
 */
export const heroArtRef = (image: HTMLImageElement | null): void => {
  const hasFailed = image && image.complete && image.naturalWidth === 0;

  if (!hasFailed) return;
  if (JPG.test(image.src)) image.src = asPng(image.src);
  else if (!image.src.endsWith(PLACEHOLDER_ART)) image.src = PLACEHOLDER_ART;
};

/**
 * A hero skill's art for its cast popup, as a CSS `background-image`:
 * `skill-<n>-card` (made for the popup, any shape), then the round icon
 * `skill-<n>`, each as `.jpg` or `.png`, then the placeholder.
 */
export const skillCardArt = (heroId: string, index: number): string =>
  [
    ...fileLayers(heroImage(heroId, `skill-${index + 1}-card`)),
    ...fileLayers(heroImage(heroId, `skill-${index + 1}`)),
    PLACEHOLDER_ART,
  ]
    .map((u) => `url(${u})`)
    .join(', ');

/**
 * The art layers for a hero skill's card (`skillCard` ids are
 * `HERO_SKILL_<HERO>_<index>`); undefined for any other card id.
 */
export const skillArtFor = (cardId: string): string | undefined => {
  const m = /^HERO_SKILL_(.+)_(\d+)$/.exec(cardId);
  return m ? skillCardArt(m[1], +m[2]) : undefined;
};
