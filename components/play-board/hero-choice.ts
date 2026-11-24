import { heroes, Rng } from '../../engine';
import { currentHeroKey } from '../../engine/heroes/classes';

/**
 * `'random'`, `'none'` (no hero skills, the old game: only the debug `?h0=none`
 * and tests use it, the picker does not offer it) or a hero key such as
 * `WIZARD`.
 */
export type HeroChoice = string;
export const HERO_RANDOM: HeroChoice = 'random';
export const HERO_NONE: HeroChoice = 'none';

export interface HeroOption {
  value: HeroChoice;
  label: string;
  /** The hero's three skills, one line */
  plan?: string;
}

export const heroOptions = (): HeroOption[] => [
  { value: HERO_RANDOM, label: 'Random hero' },
  ...heroes().map((h) => ({
    value: h.id,
    label: h.name,
    plan: h.skills.map((s) => `${s.name} (${s.cost})`).join(', '),
  })),
];

/**
 * A valid choice: an old hero key becomes its class key; anything unknown
 * (including a saved 'none' from before the picker dropped it) becomes Random.
 */
export const normalizeHeroChoice = (choice: unknown): HeroChoice => {
  const key = typeof choice === 'string' ? currentHeroKey(choice) : undefined;

  return heroOptions().some((option) => option.value === key)
    ? (key as HeroChoice)
    : HERO_RANDOM;
};

/**
 * The hero key a choice stands for (`undefined` for none; Random draws from
 * `rng`).
 */
export const resolveHero = (
  choice: HeroChoice,
  rng: Rng,
): string | undefined => {
  if (choice === HERO_NONE) return undefined;
  const all = heroes();
  const picked = all.find((h) => h.id === choice);
  return (picked ?? all[rng.int(all.length)]).id;
};

const KEY = 'ccg.heroes.v1';

export const loadHeroChoices = (): Record<'0' | '1', HeroChoice> => {
  try {
    const raw = JSON.parse(window.localStorage.getItem(KEY) ?? '{}');
    return {
      '0': normalizeHeroChoice(raw['0']),
      '1': normalizeHeroChoice(raw['1']),
    };
  } catch {
    return { '0': HERO_RANDOM, '1': HERO_RANDOM };
  }
};
export const saveHeroChoices = (
  choices: Record<'0' | '1', HeroChoice>,
): void => {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(choices));
  } catch {
    /* not saved */
  }
};
