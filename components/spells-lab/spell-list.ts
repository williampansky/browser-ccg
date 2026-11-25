import { heroes, loadHsCards } from '../../engine';
import { CLASS_KEYS } from '../../engine/heroes/classes';

/** One spell the lab can pick: a spell card or a hero skill. */
export interface SpellEntry {
  /** A card id, or `<CLASS>:<skill number>` for a hero skill */
  key: string;
  /** What the picker shows and matches typing against */
  label: string;
  /** `Hero skills`, `Neutral cards` or `<Class> cards` */
  group: string;
  name: string;
  cost: number;
  text: string;
  isSkill: boolean;
}

const titleCase = (key: string): string =>
  key.charAt(0) + key.slice(1).toLowerCase();

const classOrder = (heroClass: string | undefined): number =>
  heroClass ? CLASS_KEYS.indexOf(heroClass as (typeof CLASS_KEYS)[number]) : -1;

/**
 * Every spell the lab can tune: each hero skill, then every spell card
 * (neutral ones first, then each class's), whatever the set. Cards the game
 * leaves out (inactive, unnamed) are not listed.
 */
export const spellEntries = (): SpellEntry[] => {
  const skills: SpellEntry[] = heroes().flatMap((hero) =>
    hero.skills.map((skill) => ({
      key: `${hero.id}:${skill.index + 1}`,
      label: `${skill.name} (${titleCase(hero.id)} skill ${skill.index + 1})`,
      group: 'Hero skills',
      name: skill.name,
      cost: skill.cost,
      text: skill.text,
      isSkill: true,
    })),
  );
  const isListed = (card: { type: string; active: boolean; name?: string }) =>
    card.type === 'spell' && card.active && !!card.name;
  const cards: SpellEntry[] = Array.from(loadHsCards().byId.values())
    .filter(isListed)
    .sort(
      (a, b) =>
        classOrder(a.heroClass) - classOrder(b.heroClass) ||
        a.id.localeCompare(b.id),
    )
    .map((card) => ({
      key: card.id,
      label: `${card.name} (${card.id}, cost ${card.cost})`,
      group: card.heroClass
        ? `${titleCase(card.heroClass)} cards`
        : 'Neutral cards',
      name: card.name ?? card.id,
      cost: card.cost,
      text: card.text,
      isSkill: false,
    }));
  return [...skills, ...cards];
};
