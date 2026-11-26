import { getCardDef, heroes, loadHsCards } from '../../engine';
import type { Card } from '../../engine';
import { CLASS_KEYS } from '../../engine/heroes/classes';

/** One spell the lab can pick: a spell card or a hero skill. */
export interface SpellEntry {
  /** A card id, or `<CLASS>:<skill number>` for a hero skill */
  key: string;
  /** What the picker shows and matches typing against */
  label: string;
  /** `Events`, `Hero skills`, `Minions`, `Neutral cards` or `<Class> cards` */
  group: string;
  name: string;
  cost: number;
  text: string;
  isSkill: boolean;
}

/** The events that can have an effect (`EVENT_KEYS`), as the lab lists them. */
const EVENT_ENTRIES = [
  {
    key: 'summon',
    label: 'Minion summoned (every summon, event)',
    name: 'Minion summoned',
    text: 'Plays on every minion that is summoned or played, centred on it.',
  },
  {
    key: 'heal',
    label: 'Something healed (every heal, event)',
    name: 'Something healed',
    text: 'Plays on every heal, centred on what was healed. Off until you bake a look for it.',
  },
  {
    key: 'buff',
    label: 'Minion buffed (every buff, event)',
    name: 'Minion buffed',
    text: 'Plays on every minion that gains Attack or Health. Off until you bake a look for it.',
  },
  {
    key: 'death',
    label: 'Minion died (every death, event)',
    name: 'Minion died',
    text: 'Plays where every minion dies. Off until you bake a look for it.',
  },
];

const titleCase = (key: string): string =>
  key.charAt(0) + key.slice(1).toLowerCase();

const classOrder = (heroClass: string | undefined): number =>
  heroClass ? CLASS_KEYS.indexOf(heroClass as (typeof CLASS_KEYS)[number]) : -1;

/**
 * Minions that can make an effect of their own: an On Play effect, or a
 * trigger (PRIME_245 fires at the end of its owner's turn). They are tuned
 * under the minion's card id, which is what the board looks up when the
 * effect comes from the minion rather than from a spell.
 */
const minionsWithEffects = (): Card[] =>
  Array.from(loadHsCards().byId.values())
    .filter((card) => {
      if (card.type !== 'minion' || !card.active || !card.name) return false;
      if (card.isToken) return false;
      const def = getCardDef(card);

      return !!def && (!!def.triggers?.length || !!def.onPlay?.length);
    })
    .sort((a, b) => a.id.localeCompare(b.id));

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
  const minions: SpellEntry[] = minionsWithEffects().map((card) => ({
    key: card.id,
    label: `${card.name} (${card.id}, minion, cost ${card.cost})`,
    group: 'Minions',
    name: card.name ?? card.id,
    cost: card.cost,
    text: card.text,
    isSkill: false,
  }));
  const events: SpellEntry[] = EVENT_ENTRIES.map((event) => ({
    key: event.key,
    label: event.label,
    group: 'Events',
    name: event.name,
    cost: 0,
    text: event.text,
    isSkill: false,
  }));
  return [...events, ...skills, ...minions, ...cards];
};
