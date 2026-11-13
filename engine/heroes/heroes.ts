import heroData from '../../data/heroes.json';
import abilityData from '../../data/abilities.json';
import mechanics from '../../data/mechanics.json';
import constants from '../../data/constants.json';
import type { TargetFilter, Effect } from '../effects/types';
import { SKILL_CODE } from './skill-effects';

export interface HeroSkill {
  /** 0, 1 or 2: the order on the hero bar (the ability's `id` minus one) */
  index: number;
  name: string;
  cost: number;
  /** Own turns to wait after using it; `undefined` means it can be used once per game (an ultimate) */
  cooldown?: number;
  text: string;
  /** Set when the skill needs a target */
  target?: TargetFilter;
  effects: Effect[];
}

export interface HeroInfo {
  /** `ZEUS`, `FORSAKEN_DRUID`, ... */
  id: string;
  name: string;
  shortDescription: string;
  /** `MELEE`, `RANGED` or `HYBRID` */
  archetype: string;
  /** Backstory as HTML paragraphs (from Airtable); empty when none is written yet */
  lore: string;
  artistName?: string;
  artistUrl?: string;
  skills: HeroSkill[];
}

const glossary = new Map<string, string>(
  [...(mechanics as { symbol: string; name?: string }[]), ...(constants as { symbol: string; name?: string }[])].flatMap((g) =>
    g.name ? [[g.symbol, g.name] as [string, string]] : []
  )
);
/** `%SUMMON% a 4/2 eagle` -> `Summon a 4/2 eagle`. */
const display = (text: string): string =>
  text.replace(/%[A-Z_]+%/g, (sym) => glossary.get(sym) ?? sym.replace(/%/g, '').replace(/_/g, ' ').toLowerCase());

const keyOf = (symbol: string): string => symbol.replace(/%/g, '').replace(/^HERO_/, '');

type RawAbility = { name: string; hero: string; id: number | string; cost: number; cooldown?: number; text: string; ultimate?: boolean };

/** Heroes marked active in the data that also have skill code and all three abilities. */
const build = (): HeroInfo[] => {
  const out: HeroInfo[] = [];
  for (const h of heroData as { name: string; symbol: string; active?: boolean; shortDescription?: string; archetype?: string; lore?: string; artistName?: string; artistUrl?: string }[]) {
    const id = keyOf(h.symbol);
    const code = SKILL_CODE[id];
    if (!h.active || !code) continue;
    const abilities = (abilityData as RawAbility[]).filter((a) => a.hero === h.symbol).sort((a, b) => Number(a.id) - Number(b.id));
    if (abilities.length !== code.length) continue;
    out.push({
      id,
      name: h.name,
      shortDescription: h.shortDescription ?? '',
      archetype: h.archetype ?? '',
      lore: h.lore ?? '',
      artistName: h.artistName,
      artistUrl: h.artistUrl,
      skills: abilities.map((a, index) => ({
        index,
        name: display(a.name),
        cost: a.cost,
        // An ultimate is once per game whatever cooldown the data gives it (True Form has one by mistake).
        cooldown: !a.ultimate && a.cooldown && a.cooldown > 0 ? a.cooldown : undefined,
        text: display(a.text),
        target: code[index].target,
        effects: code[index].effects,
      })),
    });
  }
  return out;
};

const HEROES = build();

/** The playable heroes. */
export const heroes = (): HeroInfo[] => HEROES;
export const getHero = (id: string | undefined): HeroInfo | undefined => HEROES.find((h) => h.id === id);
export const heroSkill = (id: string | undefined, index: number): HeroSkill | undefined => getHero(id)?.skills[index];
