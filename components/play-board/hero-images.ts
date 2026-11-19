import { PLACEHOLDER_ART } from './card-face-model';

/** Hero art under `public/images/heroes/<ID>/`: the portrait (`avatar`) and the three skill icons (`skill-1` .. `skill-3`). */
export const heroImage = (heroId: string, name: 'avatar' | 'skill-1' | 'skill-2' | 'skill-3' | string): string =>
  `/images/heroes/${heroId}/${name}.jpg`;

/** A hero skill's art for its cast popup, as a CSS `background-image`: `skill-<n>-card.jpg` (made for the popup, any shape), then the round icon `skill-<n>.jpg`, then the placeholder. */
export const skillCardArt = (heroId: string, index: number): string =>
  [heroImage(heroId, `skill-${index + 1}-card`), heroImage(heroId, `skill-${index + 1}`), PLACEHOLDER_ART].map((u) => `url(${u})`).join(', ');
