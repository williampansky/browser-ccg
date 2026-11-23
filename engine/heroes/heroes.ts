import heroData from '../../data/heroes.json';
import skillData from '../../data/skills.json';
import mechanics from '../../data/mechanics.json';
import constants from '../../data/constants.json';
import type { TargetFilter, Effect } from '../effects/types';
import { CLASS_KEYS, classKey } from './classes';
import { SKILL_CODE, type SkillCode } from './skill-effects';

export interface HeroSkill {
  /** The order on the hero bar among the class's active skills */
  index: number;
  name: string;
  cost: number;
  /**
   * Own turns to wait after using it; `undefined` means it can be used once per
   * game (an ultimate)
   */
  cooldown?: number;
  text: string;
  /**
   * Frame colour of its cast popup: the skill's `rarity` column in Airtable
   * (`COMMON`, `MYTHIC`, ...); `FREE` (steel, no gem) when blank
   */
  rarity: string;
  /** Set when the skill needs a target */
  target?: TargetFilter;
  /**
   * Set when the skill is used by picking one of a list drawn from the game
   * (see `SkillCode.options`)
   */
  options?: SkillCode['options'];
  effects: Effect[];
}

export interface HeroInfo {
  /** The class key (`WIZARD`, `FIGHTER`, ...); a hero is its class's skin */
  id: string;
  name: string;
  shortDescription: string;
  /** `MELEE`, `RANGED` or `HYBRID` */
  archetype: string;
  /**
   * Backstory as HTML paragraphs (from Airtable); empty when none is written
   * yet
   */
  lore: string;
  artistName?: string;
  artistUrl?: string;
  skills: HeroSkill[];
}

const glossary = new Map<string, string>(
  [
    ...(mechanics as { symbol: string; name?: string }[]),
    ...(constants as { symbol: string; name?: string }[]),
  ].flatMap((g) => (g.name ? [[g.symbol, g.name] as [string, string]] : [])),
);
/** `%SUMMON% a 4/2 eagle` -> `Summon a 4/2 eagle`. */
const display = (text: string): string =>
  text.replace(
    /%[A-Z_]+%/g,
    (sym) =>
      glossary.get(sym) ??
      sym.replace(/%/g, '').replace(/_/g, ' ').toLowerCase(),
  );

type RawSkill = {
  name: string;
  class?: string;
  id: number | string;
  cost: number;
  cooldown?: number;
  text: string;
  numberPrimary?: number;
  numberSecondary?: number;
  ultimate?: boolean;
  rarity?: string;
  active?: boolean;
};

type RawHero = {
  name: string;
  symbol: string;
  class?: string;
  active?: boolean;
  shortDescription?: string;
  archetype?: string;
  lore?: string;
  artistName?: string;
  artistUrl?: string;
};

const classOrder = (hero: HeroInfo): number =>
  CLASS_KEYS.indexOf(hero.id as (typeof CLASS_KEYS)[number]);

/** The code entry for a skill: entry `n` is the skill with id `n + 1`. */
const codeFor = (code: SkillCode[], skill: RawSkill): SkillCode | undefined =>
  code[Number(skill.id) - 1];

/**
 * A class's skills are the active skills of its class in the SKILLS table
 * (shelved skills are simply inactive). Its hero is the first active hero of
 * that class; a class with no skill code, no active skill, or an active skill
 * without code is not offered yet.
 */
const build = (): HeroInfo[] => {
  const out: HeroInfo[] = [];

  for (const hero of heroData as RawHero[]) {
    if (!hero.active || !hero.class) continue;

    const id = classKey(hero.class);
    const code = SKILL_CODE[id];

    if (!code || out.some((existing) => existing.id === id)) continue;

    const skills = (skillData as RawSkill[])
      .filter((skill) => skill.class === hero.class && skill.active)
      .sort((a, b) => Number(a.id) - Number(b.id));
    const isComplete = skills.every((skill) => codeFor(code, skill));

    if (skills.length === 0 || !isComplete) continue;

    out.push({
      id,
      name: hero.name,
      shortDescription: hero.shortDescription ?? '',
      archetype: hero.archetype ?? '',
      lore: hero.lore ?? '',
      artistName: hero.artistName,
      artistUrl: hero.artistUrl,
      skills: skills.map((skill, index) => {
        const { target, options, effects } = codeFor(code, skill)!;

        return {
          index,
          name: display(skill.name),
          cost: skill.cost,
          // An ultimate is once per game whatever cooldown the data gives it
          // (True Form has one by mistake).
          cooldown:
            !skill.ultimate && skill.cooldown && skill.cooldown > 0
              ? skill.cooldown
              : undefined,
          text: display(
            skill.text
              .replace(/%NUM1%/g, String(skill.numberPrimary ?? ''))
              .replace(/%NUM2%/g, String(skill.numberSecondary ?? '')),
          ),
          rarity:
            skill.rarity?.replace(/%/g, '').replace(/^RARITY_/, '') || 'FREE',
          target,
          options,
          effects,
        };
      }),
    });
  }

  return out.sort((a, b) => classOrder(a) - classOrder(b));
};

const HEROES = build();

/** The playable heroes. */
export const heroes = (): HeroInfo[] => HEROES;
export const getHero = (id: string | undefined): HeroInfo | undefined =>
  HEROES.find((h) => h.id === id);
export const heroSkill = (
  id: string | undefined,
  index: number,
): HeroSkill | undefined => getHero(id)?.skills[index];
