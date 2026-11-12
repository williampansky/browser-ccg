import { damageTarget, healTarget } from '../rules/damage';
import { drawCard } from '../rules/draw';
import { findMinion, opponentOf } from '../rules/lookup';
import { withSpellPower } from '../rules/spell-power';
import { createMinion } from '../rules/minion';
import { summonMinion } from '../rules/summon';
import { MAX_ENERGY, MAX_HAND, type MinionKeywords } from '../state/types';
import type { Effect, Selector } from './types';

/** Deals `amount` damage to everything the selector picks. */
export const damage =
  (select: Selector, amount: number): Effect =>
  (ctx) => {
    const total = withSpellPower('damage', amount, ctx.spellDamage);
    for (const t of select(ctx)) damageTarget(ctx.g, t, total, ctx.events);
  };

/** Restores up to `amount` health (never above the maximum). */
export const heal =
  (select: Selector, amount: number): Effect =>
  (ctx) => {
    const total = withSpellPower('heal', amount, ctx.spellDamage);
    for (const t of select(ctx)) healTarget(ctx.g, t, total, ctx.events);
  };

/** The caster draws `count` cards (full hand burns, empty deck is fatigue). */
export const draw =
  (count: number): Effect =>
  (ctx) => {
    for (let i = 0; i < count; i++) drawCard(ctx.g, ctx.caster, ctx.events);
  };

/** Adds energy for this turn only. May exceed the total; the refill at next turn start resets it. */
export const gainEnergy =
  (amount: number): Effect =>
  (ctx) => {
    ctx.g.players[ctx.caster].energy.current += amount;
    ctx.events.push({ type: 'EnergyGained', player: ctx.caster, amount });
  };

/** Finds the live (draft) minion a target refers to; heroes and missing minions give nothing. */
const minionsOf = (ctx: Parameters<Effect>[0], select: Selector) =>
  select(ctx).flatMap((t) => {
    if (t.kind !== 'minion') return [];
    const found = findMinion(ctx.g, t.instanceId);
    return found ? [found] : [];
  });

/** Gives minions a keyword (Bubble, double attack, ...). */
export const grantKeyword =
  (select: Selector, keyword: keyof MinionKeywords): Effect =>
  (ctx) => {
    for (const { minion } of minionsOf(ctx, select)) minion.keywords[keyword] = true;
  };

/** Disable: the minion cannot attack during its owner's next turn (RULES Q17). */
export const disable =
  (select: Selector): Effect =>
  (ctx) => {
    // Turns alternate, so the owner's next turn is the next turn, or the one after if it is theirs now.
    const until = (owner: string) => (ctx.g.activePlayer === owner ? ctx.g.turn + 2 : ctx.g.turn + 1);
    for (const { owner, minion } of minionsOf(ctx, select)) minion.disabledOnTurn = until(owner);
    // A disabled hero cannot attack with its weapon.
    for (const t of select(ctx)) if (t.kind === 'hero') ctx.g.players[t.player].heroDisabledOnTurn = until(t.player);
  };

/** Expiration: the minion dies at the start of the caster's next turn (RULES Q18, provisional). */
export const expire =
  (select: Selector): Effect =>
  (ctx) => {
    for (const { minion } of minionsOf(ctx, select)) {
      minion.expiresOnTurn = ctx.g.activePlayer === ctx.caster ? ctx.g.turn + 2 : ctx.g.turn + 1;
    }
  };

/** Summons the `index`-th token from the running card's entourage list (full board: nothing happens). */
export const summonEntourage =
  (index = 0): Effect =>
  (ctx) => {
    const source = ctx.sourceCardId ? ctx.catalog.get(ctx.sourceCardId) : undefined;
    const token = source && ctx.catalog.get(source.entourage[index]);
    if (!token) throw new Error(`${ctx.sourceCardId} has no entourage token #${index} in the catalog`);
    summonMinion(ctx.g, ctx.caster, token, ctx.events, ctx.self);
  };

/** Permanently adds attack and health (current and maximum) to minions. */
export const buff =
  (select: Selector, attack: number, health: number): Effect =>
  (ctx) => {
    for (const { minion } of minionsOf(ctx, select)) {
      minion.attack += attack;
      minion.maxHealth += health;
      minion.health += health;
    }
  };

/** The caster's hero gains armor (no cap; armor does not decay). */
export const addArmor =
  (amount: number): Effect =>
  (ctx) => {
    ctx.g.players[ctx.caster].armor += amount;
    ctx.events.push({ type: 'ArmorGained', player: ctx.caster, amount });
  };

/** Raises the caster's weapon attack. Does nothing without a weapon. */
export const buffWeapon =
  (attack: number): Effect =>
  (ctx) => {
    const weapon = ctx.g.players[ctx.caster].weapon;
    if (weapon) weapon.attack += attack;
  };

/** Like `buffWeapon`, but only until the end of the turn (the attack is taken back by `endTurnCleanup`). */
export const buffWeaponThisTurn =
  (attack: number): Effect =>
  (ctx) => {
    const weapon = ctx.g.players[ctx.caster].weapon;
    if (!weapon) return;
    weapon.attack += attack;
    weapon.tempAttack = (weapon.tempAttack ?? 0) + attack;
  };

/** Adds an empty energy slot (capped at 10). The new slot is not filled until next turn's refill. */
export const gainEnergySlot =
  (amount = 1): Effect =>
  (ctx) => {
    const e = ctx.g.players[ctx.caster].energy;
    e.total = Math.min(MAX_ENERGY, e.total + amount);
  };

/** Summons one token chosen at random from the running card's entourage list. */
export const summonRandomEntourage = (): Effect => (ctx) => {
  const source = ctx.sourceCardId ? ctx.catalog.get(ctx.sourceCardId) : undefined;
  const id = source && ctx.rng.shuffle([...source.entourage])[0];
  const token = id && ctx.catalog.get(id);
  if (!token) throw new Error(`${ctx.sourceCardId} has no entourage tokens in the catalog`);
  summonMinion(ctx.g, ctx.caster, token, ctx.events, ctx.self);
};

/** Destroys minions outright. Ignores Bubble and health (RULES: destroy is not damage). */
export const destroy =
  (select: Selector): Effect =>
  (ctx) => {
    for (const { minion } of minionsOf(ctx, select)) minion.health = 0;
  };

/** Sets the base attack to an exact value (text wins over hsclone for 075); auras and this-turn boosts still apply on top. */
export const setAttack =
  (select: Selector, value: number): Effect =>
  (ctx) => {
    for (const { minion } of minionsOf(ctx, select)) minion.attack = value + minion.auraAttack + minion.tempAttack;
  };

/** Sets current and maximum health to an exact value. */
export const setHealth =
  (select: Selector, value: number): Effect =>
  (ctx) => {
    for (const { minion } of minionsOf(ctx, select)) {
      minion.health = value;
      minion.maxHealth = value;
    }
  };

/** Doubles current health. Maximum health rises by the same amount, so it acts as a +X health buff. */
export const doubleHealth =
  (select: Selector): Effect =>
  (ctx) => {
    for (const { minion } of minionsOf(ctx, select)) {
      minion.maxHealth += minion.health;
      minion.health *= 2;
    }
  };

/** Restores minions to full health. */
export const healToFull =
  (select: Selector): Effect =>
  (ctx) => {
    for (const { minion } of minionsOf(ctx, select)) minion.health = minion.maxHealth;
  };

/**
 * Replaces each minion, in the same slot, with a fresh copy of the running card's `index`-th entourage
 * token. Damage, buffs, keywords and timers are all gone; the new minion has summoning sickness.
 */
export const transformInto =
  (select: Selector, index = 0): Effect =>
  (ctx) => {
    const source = ctx.sourceCardId ? ctx.catalog.get(ctx.sourceCardId) : undefined;
    const token = source && ctx.catalog.get(source.entourage[index]);
    if (!token) throw new Error(`${ctx.sourceCardId} has no entourage token #${index} in the catalog`);
    for (const { owner, minion } of minionsOf(ctx, select)) {
      const board = ctx.g.players[owner].board;
      const slot = board.findIndex((m) => m.instanceId === minion.instanceId);
      board[slot] = createMinion(token, ctx.g.nextInstanceId++, ctx.g.turn, ctx.g.nextPlaySeq++);
    }
  };

/** Takes control of enemy minions. With no room on the caster's board, the minion stays put. */
export const steal =
  (select: Selector): Effect =>
  (ctx) => {
    const foe = opponentOf(ctx.caster);
    for (const { owner, minion } of minionsOf(ctx, select)) {
      const mine = ctx.g.players[ctx.caster].board;
      if (owner === ctx.caster || mine.length >= 7) continue;
      const theirs = ctx.g.players[foe].board;
      theirs.splice(theirs.findIndex((m) => m.instanceId === minion.instanceId), 1);
      minion.playedOnTurn = ctx.g.turn; // summoning sickness under the new owner
      minion.attacksThisTurn = 0;
      delete minion.disabledOnTurn;
      mine.push(minion);
    }
  };

/** The caster discards `count` random cards from hand (fewer if the hand is smaller). */
export const discardRandom =
  (count = 1): Effect =>
  (ctx) => {
    const hand = ctx.g.players[ctx.caster].hand;
    for (let i = 0; i < count && hand.length > 0; i++) {
      const [gone] = hand.splice(ctx.rng.shuffle(hand.map((_, k) => k))[0], 1);
      ctx.events.push({ type: 'Discarded', player: ctx.caster, instanceId: gone.instanceId });
    }
  };

/** Destroys the opponent's weapon, if any. */
export const destroyEnemyWeapon = (): Effect => (ctx) => {
  const foe = ctx.g.players[opponentOf(ctx.caster)];
  if (foe.weapon) {
    foe.weapon = null;
    ctx.events.push({ type: 'WeaponBroke', player: opponentOf(ctx.caster) });
  }
};

/** Deals damage, then heals the caster's hero for the damage actually dealt (Bubble-absorbed hits heal nothing). */
export const damageWithLifesteal =
  (select: Selector, amount: number): Effect =>
  (ctx) => {
    const before = ctx.events.length;
    damage(select, amount)(ctx);
    const dealt = ctx.events
      .slice(before)
      .reduce((sum, e) => sum + (e.type === 'MinionDamaged' || e.type === 'HeroDamaged' ? e.amount : 0), 0);
    if (dealt > 0) heal(ownHeroRef, dealt)(ctx);
  };
const ownHeroRef: Selector = (ctx) => [{ kind: 'hero', player: ctx.caster }];

/** The caster draws a card if the selected minion is at 0 health (use right after damaging it). */
export const drawIfDead =
  (select: Selector): Effect =>
  (ctx) => {
    const dead = select(ctx).some((t) => t.kind === 'minion' && (findMinion(ctx.g, t.instanceId)?.minion.health ?? 0) <= 0);
    if (dead) draw(1)(ctx);
  };

/** Gives the running minion +`attack`/+`health` for each OTHER minion its owner has. */
export const buffPerOtherFriendly =
  (attack: number, health: number): Effect =>
  (ctx) => {
    const others = ctx.g.players[ctx.caster].board.filter((m) => m.instanceId !== ctx.self).length;
    buff((c) => (c.self === undefined ? [] : [{ kind: 'minion', instanceId: c.self }]), attack * others, health * others)(ctx);
  };

/** Sacrifices (destroys) the chosen friendly minion and heals the caster's hero. */
export const sacrificeFor =
  (select: Selector, healAmount: number): Effect =>
  (ctx) => {
    const victims = minionsOf(ctx, select).filter((x) => x.owner === ctx.caster);
    if (victims.length === 0) return;
    destroy(select)(ctx);
    heal(ownHeroRef, healAmount)(ctx);
  };

/**
 * Looks at the top `look` cards of the caster's deck, keeps the one at `keep` (the last one if fewer
 * were available) and discards the rest. A full hand burns the kept card. An empty deck does nothing
 * (looking is not drawing, so no fatigue).
 */
export const keepFromTop =
  (look: number, keep: number): Effect =>
  (ctx) => {
    const p = ctx.g.players[ctx.caster];
    const seen = p.deck.splice(0, look);
    if (seen.length === 0) return;
    const [kept] = seen.splice(Math.min(keep, seen.length - 1), 1);
    for (const gone of seen) ctx.events.push({ type: 'Discarded', player: ctx.caster, instanceId: gone.instanceId });
    if (p.hand.length >= MAX_HAND) {
      ctx.events.push({ type: 'Burned', player: ctx.caster, instanceId: kept.instanceId });
      return;
    }
    p.hand.push(kept);
    ctx.events.push({ type: 'Drew', player: ctx.caster, instanceId: kept.instanceId });
  };

/** "+N Attack this turn": raises attack now and takes it back when the turn ends. */
export const buffThisTurn =
  (select: Selector, attack: number): Effect =>
  (ctx) => {
    for (const { minion } of minionsOf(ctx, select)) {
      minion.attack += attack;
      minion.tempAttack += attack;
    }
  };

/** Equips a weapon with the running card's attack and health (as durability), replacing any weapon. */
export const equipWeapon =
  (opts: { temporary?: boolean } = {}): Effect =>
  (ctx) => {
    const card = ctx.sourceCardId ? ctx.catalog.get(ctx.sourceCardId) : undefined;
    if (!card) throw new Error('equipWeapon needs a running card');
    ctx.g.players[ctx.caster].weapon = {
      instanceId: ctx.g.nextInstanceId++,
      cardId: card.id,
      attack: card.attack ?? 0,
      durability: card.health ?? 0,
      ...(opts.temporary ? { temporary: true } : {}),
    };
    ctx.events.push({ type: 'WeaponEquipped', player: ctx.caster, cardId: card.id });
  };

/** Adds a copy of a random card the opponent has played to the caster's hand (burned if the hand is full). */
export const obtainOpponentPlayedCard = (): Effect => (ctx) => {
  const history = ctx.g.played[opponentOf(ctx.caster)];
  if (history.length === 0) return;
  const cardId = ctx.rng.shuffle([...history])[0];
  const instanceId = ctx.g.nextInstanceId++;
  const p = ctx.g.players[ctx.caster];
  if (p.hand.length >= MAX_HAND) {
    ctx.events.push({ type: 'Burned', player: ctx.caster, instanceId });
    return;
  }
  p.hand.push({ instanceId, cardId });
  ctx.events.push({ type: 'CardObtained', player: ctx.caster, instanceId });
};

/**
 * Suppress: the minion loses its card's behaviour (triggers, auras, spell damage, cost changes, demise) and all its
 * keywords, and any Disable. Its stats, damage and buffs stay as they are. Heroes are not affected.
 */
export const silence =
  (select: Selector): Effect =>
  (ctx) => {
    for (const { minion } of minionsOf(ctx, select)) {
      minion.silenced = true;
      minion.keywords = { guard: false, rush: false, bubble: false, doubleAttack: false, hidden: false, noAttack: false };
      minion.auraRush = false;
      delete minion.disabledOnTurn;
    }
  };

/** Swaps each minion's Attack and Health (maximum health follows). A minion with 0 Attack ends at 0 health and dies. */
export const swapAttackAndHealth =
  (select: Selector): Effect =>
  (ctx) => {
    for (const { minion } of minionsOf(ctx, select)) {
      const base = minion.attack - minion.auraAttack - minion.tempAttack;
      const attack = minion.health;
      minion.health = base;
      minion.maxHealth = base;
      minion.attack = attack + minion.auraAttack + minion.tempAttack;
    }
  };

/** Sets each minion's base Attack to its current Health. */
export const setAttackToHealth =
  (select: Selector): Effect =>
  (ctx) => {
    for (const { minion } of minionsOf(ctx, select)) minion.attack = minion.health + minion.auraAttack + minion.tempAttack;
  };

/** Doubles each minion's current Attack (the extra stays after the turn, like a buff). */
export const doubleAttackStat =
  (select: Selector): Effect =>
  (ctx) => {
    for (const { minion } of minionsOf(ctx, select)) minion.attack += minion.attack;
  };

/** Sets a hero's health to an exact value (it may go up or down; armor is untouched). */
export const setHeroHealth =
  (select: Selector, value: number): Effect =>
  (ctx) => {
    for (const t of select(ctx)) if (t.kind === 'hero') ctx.g.players[t.player].health = value;
  };

/** Runs `make(ctx)` to build the effect from the live game state (for amounts that depend on it, like armor or hand size). */
export const computed =
  (make: (ctx: Parameters<Effect>[0]) => Effect): Effect =>
  (ctx) =>
    make(ctx)(ctx);

/** Lowers each minion's Attack by `amount` (never below 0). */
export const reduceAttack =
  (select: Selector, amount: number): Effect =>
  (ctx) => {
    for (const { minion } of minionsOf(ctx, select)) minion.attack = Math.max(0, minion.attack - amount);
  };

/** Halves each minion's current and maximum Health, rounded up. */
export const halveHealth =
  (select: Selector): Effect =>
  (ctx) => {
    for (const { minion } of minionsOf(ctx, select)) {
      minion.health = Math.ceil(minion.health / 2);
      minion.maxHealth = Math.max(minion.health, Math.ceil(minion.maxHealth / 2));
    }
  };

/** Adds a card to the caster's hand (burned if full). `costDelta` follows that copy ("costs 1 less" is -1). */
export const addCardToHand =
  (cardId: string | ((ctx: Parameters<Effect>[0]) => string | undefined), costDelta = 0): Effect =>
  (ctx) => {
    const id = typeof cardId === 'function' ? cardId(ctx) : cardId;
    if (!id) return;
    const instanceId = ctx.g.nextInstanceId++;
    const p = ctx.g.players[ctx.caster];
    if (p.hand.length >= MAX_HAND) {
      ctx.events.push({ type: 'Burned', player: ctx.caster, instanceId });
      return;
    }
    p.hand.push({ instanceId, cardId: id, ...(costDelta ? { costDelta } : {}) });
    ctx.events.push({ type: 'CardObtained', player: ctx.caster, instanceId });
  };

/** While a Mystery reacts to an attack: the attack goes to the minion most recently summoned for the caster (if any). */
export const redirectAttackToSummoned = (): Effect => (ctx) => {
  if (!ctx.attack) return;
  for (let i = ctx.events.length - 1; i >= 0; i--) {
    const e = ctx.events[i];
    if (e.type === 'MinionSummoned' && e.player === ctx.caster) {
      ctx.attack.target = { kind: 'minion', instanceId: e.instanceId };
      return;
    }
  }
};

/** While a Mystery reacts to a spell: the spell goes to a random minion the spell's caster controls (unchanged if they have none). */
export const redirectCastToCasterMinion = (): Effect => (ctx) => {
  if (!ctx.cast?.target) return;
  const mine = ctx.g.players[ctx.cast.caster].board;
  if (mine.length === 0) return;
  ctx.cast.target = { kind: 'minion', instanceId: ctx.rng.shuffle([...mine])[0].instanceId };
};

/** Every Concealed minion loses Concealed and takes 1 damage. */
export const revealHidden = (): Effect => (ctx) => {
  for (const owner of ['0', '1'] as const) {
    for (const m of ctx.g.players[owner].board) {
      if (!m.keywords.hidden) continue;
      m.keywords.hidden = false;
      damageTarget(ctx.g, { kind: 'minion', instanceId: m.instanceId }, 1, ctx.events);
    }
  }
};

/** Destroys the opponent's Mystery. Then, if there was one, runs `then`. */
export const destroyEnemyMystery =
  (...then: Effect[]): Effect =>
  (ctx) => {
    const foe = ctx.g.players[opponentOf(ctx.caster)];
    if (!foe.mystery) return;
    ctx.events.push({ type: 'MysteryRevealed', player: opponentOf(ctx.caster), cardId: foe.mystery.cardId });
    foe.mystery = null;
    for (const effect of then) effect(ctx);
  };

/** Takes the opponent's Mystery for the caster (it stays face down). If the caster already has one, it is just destroyed. */
export const stealEnemyMystery = (): Effect => (ctx) => {
  const me = ctx.g.players[ctx.caster];
  const foe = ctx.g.players[opponentOf(ctx.caster)];
  if (!foe.mystery) return;
  if (!me.mystery) me.mystery = foe.mystery;
  foe.mystery = null;
};

/** Draws `count` cards; each card drawn this way has its cost changed by `delta` (negative is cheaper) for the rest of the game. */
export const drawDiscounted =
  (count: number, delta: number): Effect =>
  (ctx) => {
    const before = ctx.events.length;
    draw(count)(ctx);
    for (const e of ctx.events.slice(before)) {
      if (e.type !== 'Drew') continue;
      const card = ctx.g.players[ctx.caster].hand.find((c) => c.instanceId === e.instanceId);
      if (card) card.costDelta = (card.costDelta ?? 0) + delta;
    }
  };

/** Disables only the selected minions that pass `test`. */
export const disableWhere =
  (select: Selector, test: (m: { health: number; attack: number }) => boolean): Effect =>
  (ctx) => {
    const passing = minionsOf(ctx, select)
      .filter(({ minion }) => test(minion))
      .map(({ minion }) => ({ kind: 'minion' as const, instanceId: minion.instanceId }));
    disable(() => passing)(ctx);
  };
