import type { CardCatalog } from '../cards/types';
import type { Effect, SkillOption, TargetFilter } from '../effects/types';
import type { GameState, PlayerId } from '../state/types';
import { addArmor, buff, damage, heal } from '../effects/primitives';
import { allEnemyMinions, chosenTarget, enemyHero, friendlyOfRace } from '../effects/selectors';
import { damageTarget } from '../rules/damage';
import { withSpellPower } from '../rules/spell-power';
import { summonMinion } from '../rules/summon';
import { resurrectOptions } from './resurrect-offer';
import { heroToken } from './tokens';

/** What a skill does besides its numbers (those come from the ABILITIES table): who it may aim at, and the effects. */
export interface SkillCode {
  target?: TargetFilter;
  /** When set, the skill is used by picking one of these (listed fresh from the game state); with none to list it cannot be used */
  options?: (state: GameState, player: PlayerId, catalog: CardCatalog) => SkillOption[];
  effects: Effect[];
}

const anyCharacter: TargetFilter = () => true;

const summonToken =
  (id: string): Effect =>
  (ctx) => {
    summonMinion(ctx.g, ctx.caster, heroToken(id), ctx.events);
  };

const summonRandomToken =
  (ids: string[]): Effect =>
  (ctx) => {
    summonMinion(ctx.g, ctx.caster, heroToken(ids[ctx.rng.int(ids.length)]), ctx.events);
  };

/** Summons the hero token with `attack` / `health` added on top of its own numbers (nothing happens if the board is full). */
const summonBuffed =
  (id: string, attack: number, health: number): Effect =>
  (ctx) => {
    const board = ctx.g.players[ctx.caster].board;
    if (!summonMinion(ctx.g, ctx.caster, heroToken(id), ctx.events)) return;
    const m = board[board.length - 1];
    m.attack += attack;
    m.maxHealth += health;
    m.health += health;
  };

/** Brings back up to `count` random dead friendly minions (each only once), fresh and without a warcry. */
const resurrect =
  (count: number): Effect =>
  (ctx) => {
    const p = ctx.g.players[ctx.caster];
    for (let i = 0; i < count; i++) {
      const dead = p.graveyard ?? [];
      if (dead.length === 0) return;
      const [id] = dead.splice(ctx.rng.int(dead.length), 1);
      const card = ctx.catalog.get(id);
      if (card) summonMinion(ctx.g, ctx.caster, card, ctx.events);
    }
  };

const hitChosen =
  (amount: (ctx: Parameters<Effect>[0]) => number): Effect =>
  (ctx) => {
    for (const t of chosenTarget()(ctx)) damageTarget(ctx.g, t, withSpellPower('damage', amount(ctx), ctx.spellDamage), ctx.events);
  };

/**
 * Cleric: brings back the minion the player picked from `resurrectOptions`, with Guard or Bubble (fresh and without a warcry). It leaves
 * the graveyard it came from, which for a stolen enemy minion is the enemy's. Nothing happens if the board is full.
 */
const resurrectPicked = (): Effect => (ctx) => {
  const pick = resurrectOptions(ctx.g, ctx.caster, ctx.catalog)[ctx.choice ?? -1];
  const id = pick?.cardId;
  const card = id ? ctx.catalog.get(id) : undefined;
  if (!pick || !id || !card || !pick.from) return;
  const board = ctx.g.players[ctx.caster].board;
  if (!summonMinion(ctx.g, ctx.caster, card, ctx.events)) return;
  const minion = board[board.length - 1];
  if (pick.keyword === 'GUARD') minion.keywords.guard = true;
  else minion.keywords.bubble = true;
  const grave = ctx.g.players[pick.from].graveyard ?? [];
  grave.splice(grave.lastIndexOf(id), 1);
};

/** Warrior's Last Stand: Health is set to `health` (up, or down from a higher total) and the hero gains `armor`. */
const lastStand =
  (health: number, armor: number): Effect =>
  (ctx) => {
    ctx.g.players[ctx.caster].health = health;
    addArmor(armor)(ctx);
  };

/** Skill code per hero key; entry `n` is that hero's ability with id `n + 1`. */
export const SKILL_CODE: Record<string, SkillCode[]> = {
  ZEUS: [
    { target: anyCharacter, effects: [damage(chosenTarget(), 1)] },
    { effects: [damage(allEnemyMinions(), 3)] },
    { target: anyCharacter, effects: [damage(chosenTarget(), 10)] },
  ],
  WARRIOR: [
    { effects: [addArmor(2)] },
    { target: anyCharacter, effects: [hitChosen((ctx) => (ctx.g.players[ctx.caster].health <= 12 ? 6 : 4))] },
    { effects: [lastStand(15, 10)] },
  ],
  SAGE: [
    { target: anyCharacter, effects: [heal(chosenTarget(), 3)] },
    { options: resurrectOptions, effects: [resurrectPicked()] },
    { effects: [resurrect(3)] },
  ],
  EXILE: [
    { effects: [damage(enemyHero(), 2)] },
    { effects: [summonToken('HERO_EXILE_EAGLE')] },
    { effects: [summonToken('HERO_EXILE_BEAST')] },
  ],
  WILDCALLER: [
    { effects: [summonRandomToken(['HERO_DRUID_WOLF', 'HERO_DRUID_BEAR', 'HERO_DRUID_HAWK'])] },
    { effects: [buff(friendlyOfRace('CREATURE'), 2, 2)] },
    // Ultimate (Stampede of the Wild): one of each Spirit Animal, each with +2/+2 (other Creatures are not buffed)
    { effects: [summonBuffed('HERO_DRUID_WOLF', 2, 2), summonBuffed('HERO_DRUID_BEAR', 2, 2), summonBuffed('HERO_DRUID_HAWK', 2, 2)] },
  ],
};
