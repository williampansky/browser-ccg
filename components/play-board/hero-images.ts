/** Hero art under `public/images/heroes/<ID>/`: the portrait (`avatar`) and the three skill icons (`skill-1` .. `skill-3`). */
export const heroImage = (heroId: string, name: 'avatar' | 'skill-1' | 'skill-2' | 'skill-3' | string): string =>
  `/images/heroes/${heroId}/${name}.jpg`;
