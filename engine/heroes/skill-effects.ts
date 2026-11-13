import type { Effect, TargetFilter } from '../effects/types';
import { addArmor, buff, damage, heal } from '../effects/primitives';
import { allEnemyMinions, chosenTarget, enemyHero, friendlyOfRace } from '../effects/selectors';
import { damageTarget } from '../rules/damage';
import { summonMinion } from '../rules/summon';
import { heroToken } from './tokens';

/** What a skill does besides its numbers (those come from the ABILITIES table): who it may aim at, and the effects. */
export interface SkillCode {
  target?: TargetFilter;
  effects: Effect[];
}

const anyCharacter: TargetFilter = () => true;
const anyMinion: TargetFilter = ({ candidate }) => candidate.kind === 'minion';

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
    for (const t of chosenTarget()(ctx)) damageTarget(ctx.g, t, amount(ctx), ctx.events);
  };

/** Druid: back to its true form. Health is raised to 15 (never lowered) and the hero gets 5/2 claws (RULES Appendix D). */
const trueForm = (): Effect => (ctx) => {
  const p = ctx.g.players[ctx.caster];
  p.health = Math.max(p.health, 15);
  const claws = heroToken('HERO_DRUID_CLAWS');
  p.weapon = { instanceId: ctx.g.nextInstanceId++, cardId: claws.id, attack: claws.attack ?? 0, durability: claws.health ?? 0 };
  ctx.events.push({ type: 'WeaponEquipped', player: ctx.caster, cardId: claws.id });
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
    { target: anyMinion, effects: [hitChosen((ctx) => ctx.g.players[ctx.caster].armor)] },
  ],
  SAGE: [
    { target: anyCharacter, effects: [heal(chosenTarget(), 2)] },
    { effects: [resurrect(1)] },
    { effects: [resurrect(3)] },
  ],
  EXILE: [
    { effects: [damage(enemyHero(), 2)] },
    { effects: [summonToken('HERO_EXILE_EAGLE')] },
    { effects: [summonToken('HERO_EXILE_BEAST')] },
  ],
  FORSAKEN_DRUID: [
    { effects: [summonRandomToken(['HERO_DRUID_WOLF', 'HERO_DRUID_BEAR', 'HERO_DRUID_HAWK'])] },
    { effects: [buff(friendlyOfRace('CREATURE'), 2, 2)] },
    { effects: [trueForm()] },
  ],
};
