import { damageTarget, healTarget } from '../rules/damage';
import { drawCard } from '../rules/draw';
import { findMinion, opponentOf } from '../rules/lookup';
import { withSpellPower } from '../rules/spell-power';
import { createMinion } from '../rules/minion';
import { summonMinion } from '../rules/summon';
import { cardPool } from '../rules/card-pool';
import type { Card } from '../cards/types';
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
    const total = withSpellPower('heal', amount, ctx.spellDamage) + (amount > 0 ? ctx.spellHealing ?? 0 : 0);
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
  (cardId: string | ((ctx: Parameters<Effect>[0]) => string | undefined), costDelta = 0, forOpponent = false): Effect =>
  (ctx) => {
    const id = typeof cardId === 'function' ? cardId(ctx) : cardId;
    if (!id) return;
    const who = forOpponent ? opponentOf(ctx.caster) : ctx.caster;
    const instanceId = ctx.g.nextInstanceId++;
    const p = ctx.g.players[who];
    if (p.hand.length >= MAX_HAND) {
      ctx.events.push({ type: 'Burned', player: who, instanceId });
      return;
    }
    p.hand.push({ instanceId, cardId: id, ...(costDelta ? { costDelta } : {}) });
    ctx.events.push({ type: 'CardObtained', player: who, instanceId });
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

/**
 * Returns the caster's selected minions to their hand (a full hand destroys them). The copy costs `costDelta` more (negative is less),
 * and with `rush` it has Rush when played again. Enemy minions are ignored.
 */
export const returnToHand =
  (select: Selector, costDelta = 0, rush = false): Effect =>
  (ctx) => {
    for (const { owner, minion } of minionsOf(ctx, select)) {
      if (owner !== ctx.caster) continue;
      const p = ctx.g.players[owner];
      p.board = p.board.filter((m) => m.instanceId !== minion.instanceId);
      if (p.hand.length >= MAX_HAND) {
        ctx.events.push({ type: 'Burned', player: owner, instanceId: minion.instanceId });
        continue;
      }
      p.hand.push({
        instanceId: minion.instanceId,
        cardId: minion.cardId,
        ...(costDelta ? { costDelta } : {}),
        ...(rush ? { rushOnPlay: true } : {}),
      });
      ctx.events.push({ type: 'CardObtained', player: owner, instanceId: minion.instanceId });
    }
  };

/** Halves each minion's Attack (rounded down). Auras and this-turn boosts stay as they are. */
export const halveAttack =
  (select: Selector): Effect =>
  (ctx) => {
    for (const { minion } of minionsOf(ctx, select)) {
      const base = minion.attack - minion.auraAttack - minion.tempAttack;
      minion.attack = Math.floor(base / 2) + minion.auraAttack + minion.tempAttack;
    }
  };

/** Swaps the caster's weakest minion (least Attack + Health) with the opponent's strongest. Does nothing if either side has none. */
export const tradeWeakestForStrongest = (): Effect => (ctx) => {
  const mine = ctx.g.players[ctx.caster].board;
  const theirs = ctx.g.players[opponentOf(ctx.caster)].board;
  if (mine.length === 0 || theirs.length === 0) return;
  const power = (m: { attack: number; health: number }) => m.attack + m.health;
  const weakest = [...mine].sort((a, b) => power(a) - power(b))[0];
  const strongest = [...theirs].sort((a, b) => power(b) - power(a))[0];
  const iw = mine.findIndex((m) => m.instanceId === weakest.instanceId);
  const is = theirs.findIndex((m) => m.instanceId === strongest.instanceId);
  mine.splice(iw, 1, strongest);
  theirs.splice(is, 1, weakest);
  for (const m of [strongest, weakest]) {
    m.playedOnTurn = ctx.g.turn; // summoning sickness under the new owner
    m.attacksThisTurn = 0;
    delete m.disabledOnTurn;
  }
};

/** Summons the running card's `index`-th entourage token for the OPPONENT, `count` times (a full board: nothing). */
export const summonEntourageForOpponent =
  (index = 0, count = 1): Effect =>
  (ctx) => {
    const source = ctx.sourceCardId ? ctx.catalog.get(ctx.sourceCardId) : undefined;
    const token = source && ctx.catalog.get(source.entourage[index]);
    if (!token) throw new Error(`${ctx.sourceCardId} has no entourage token #${index} in the catalog`);
    for (let i = 0; i < count; i++) summonMinion(ctx.g, opponentOf(ctx.caster), token, ctx.events);
  };

/** The opponent gains `amount` empty energy slots (capped at 10). */
export const giveOpponentEnergySlot =
  (amount = 1): Effect =>
  (ctx) => {
    const e = ctx.g.players[opponentOf(ctx.caster)].energy;
    e.total = Math.min(MAX_ENERGY, e.total + amount);
  };

/** The caster loses `amount` energy slots (never below 0; current energy follows). */
export const loseEnergySlot =
  (amount = 1): Effect =>
  (ctx) => {
    const e = ctx.g.players[ctx.caster].energy;
    e.total = Math.max(0, e.total - amount);
    e.current = Math.min(e.current, e.total);
  };

/** The caster draws `count` minion cards from their deck (the first ones found; they leave the deck, a full hand burns them). */
export const drawMinionsFromDeck =
  (count: number): Effect =>
  (ctx) => {
    const p = ctx.g.players[ctx.caster];
    for (let n = 0; n < count; n++) {
      const i = p.deck.findIndex((c) => ctx.catalog.get(c.cardId)?.type === 'minion');
      if (i < 0) return;
      const [card] = p.deck.splice(i, 1);
      if (p.hand.length >= MAX_HAND) ctx.events.push({ type: 'Burned', player: ctx.caster, instanceId: card.instanceId });
      else {
        p.hand.push(card);
        ctx.events.push({ type: 'Drew', player: ctx.caster, instanceId: card.instanceId });
      }
    }
  };

/** Destroys a random number (0 to all) of the minions on both boards, picked at random. */
export const destroyRandomNumberOfAll = (): Effect => (ctx) => {
  const all = [...ctx.g.players['0'].board, ...ctx.g.players['1'].board];
  const k = ctx.rng.int(all.length + 1);
  for (const m of ctx.rng.shuffle([...all]).slice(0, k)) m.health = 0;
};

/** Two random enemy minions fight: each deals its Attack to the other (no Guard, no triggers beyond the damage). */
export const forceFight = (): Effect => (ctx) => {
  const picks = ctx.rng.shuffle(ctx.g.players[opponentOf(ctx.caster)].board.filter((m) => !m.keywords.hidden)).slice(0, 2);
  if (picks.length < 2) return;
  const [a, b] = picks;
  const [aAtk, bAtk] = [a.attack, b.attack];
  damageTarget(ctx.g, { kind: 'minion', instanceId: b.instanceId }, aAtk, ctx.events);
  damageTarget(ctx.g, { kind: 'minion', instanceId: a.instanceId }, bAtk, ctx.events);
};

/** `count` times: 1 damage to a random character (hero or minion, either side). */
export const scatterDamage =
  (count: number): Effect =>
  (ctx) => {
    for (let i = 0; i < count; i++) {
      const all: Parameters<typeof damageTarget>[1][] = [
        { kind: 'hero', player: '0' },
        { kind: 'hero', player: '1' },
        ...[...ctx.g.players['0'].board, ...ctx.g.players['1'].board].filter((m) => m.health > 0).map((m) => ({ kind: 'minion' as const, instanceId: m.instanceId })),
      ];
      const pick = all[ctx.rng.int(all.length)];
      damageTarget(ctx.g, pick, withSpellPower('damage', 1, ctx.spellDamage), ctx.events);
    }
  };

/** Damage between `min` and `max` (inclusive), rolled once. */
export const randomDamage =
  (select: Selector, min: number, max: number): Effect =>
  (ctx) => {
    const amount = min + ctx.rng.int(max - min + 1);
    damage(select, amount)(ctx);
  };

/** With the given chance (0..1) runs `then`. */
export const withChance =
  (chance: number, then: Effect): Effect =>
  (ctx) => {
    if (ctx.rng.int(1000) < chance * 1000) then(ctx);
  };

/** The caster's next Mystery this turn costs 0. */
export const freeMysteryThisTurn = (): Effect => (ctx) => {
  ctx.g.players[ctx.caster].mysteryFreeOnTurn = ctx.g.turn;
};

/** Gives the OTHER player (not the one who just played the spell) a copy of the spell that was played. */
export const copyPlayedSpellToOtherHand = (): Effect => (ctx) => {
  const e = ctx.event;
  if (e?.type !== 'CardPlayed') return;
  addCardToHand(e.cardId, 0, e.player === ctx.caster)(ctx);
};

/**
 * Adds `count` random playable cards that pass `where` to the caster's hand (a full hand burns them). Each can cost `costDelta` more
 * (negative is less). With no card to pick, nothing happens.
 */
export const addRandomCardToHand =
  (where: (c: Card) => boolean = () => true, count = 1, costDelta = 0): Effect =>
  (ctx) => {
    for (let i = 0; i < count; i++) {
      const pool = cardPool(ctx.catalog, where);
      if (pool.length === 0) return;
      const card = pool[ctx.rng.int(pool.length)];
      addCardToHand(card.id, costDelta)(ctx);
    }
  };

/** Summons a random playable minion card that passes `where` for the caster (a full board: nothing). */
export const summonRandomCard =
  (where: (c: Card) => boolean): Effect =>
  (ctx) => {
    const pool = cardPool(ctx.catalog, (c) => c.type === 'minion' && where(c));
    if (pool.length === 0) return;
    summonMinion(ctx.g, ctx.caster, pool[ctx.rng.int(pool.length)], ctx.events, ctx.self);
  };

/** Runs `then` if the selected minion is at 0 health (use right after damaging it). */
export const ifDead =
  (select: Selector, then: Effect): Effect =>
  (ctx) => {
    const dead = select(ctx).some((t) => t.kind === 'minion' && (findMinion(ctx.g, t.instanceId)?.minion.health ?? 0) <= 0);
    if (dead) then(ctx);
  };

/** Adds Attack and Health "for this turn only" (the Health is taken back at the end of the turn, never leaving a minion below 1). */
export const buffThisTurnBoth =
  (select: Selector, attack: number, health: number): Effect =>
  (ctx) => {
    for (const { minion } of minionsOf(ctx, select)) {
      minion.attack += attack;
      minion.tempAttack += attack;
      minion.maxHealth += health;
      minion.health += health;
      minion.tempHealth = (minion.tempHealth ?? 0) + health;
    }
  };

/**
 * Borrows enemy minions for `turns` of the caster's turns (1 = until the end of this turn, 2 = until the end of their next turn). They go
 * home when it ends (a full home board loses them). With `canAttack` they can attack at once. No room on the caster's board: nothing happens.
 */
export const loanMinion =
  (select: Selector, turns: number, canAttack: boolean): Effect =>
  (ctx) => {
    for (const { owner, minion } of minionsOf(ctx, select)) {
      const mine = ctx.g.players[ctx.caster].board;
      if (owner === ctx.caster || mine.length >= 7) continue;
      const theirs = ctx.g.players[owner].board;
      theirs.splice(theirs.findIndex((m) => m.instanceId === minion.instanceId), 1);
      minion.loan = { from: owner, returnOnTurn: ctx.g.turn + (turns - 1) * 2 };
      minion.playedOnTurn = canAttack ? ctx.g.turn - 1 : ctx.g.turn;
      minion.attacksThisTurn = 0;
      delete minion.disabledOnTurn;
      mine.push(minion);
    }
  };

/** The running minion becomes a copy of the selected minion: its card, stats, keywords and effects (not its place or its summoning sickness). */
export const becomeCopyOf =
  (select: Selector): Effect =>
  (ctx) => {
    const me = ctx.self !== undefined ? findMinion(ctx.g, ctx.self)?.minion : undefined;
    const [src] = minionsOf(ctx, select);
    if (!me || !src) return;
    const t = src.minion;
    me.cardId = t.cardId;
    me.attack = t.attack - t.auraAttack - t.tempAttack;
    me.health = t.health;
    me.maxHealth = t.maxHealth;
    me.auraAttack = 0;
    me.auraRush = false;
    me.tempAttack = 0;
    me.keywords = { ...t.keywords };
    me.silenced = t.silenced;
    me.deathSummons = t.deathSummons ? [...t.deathSummons] : undefined;
    if (me.deathSummons === undefined) delete me.deathSummons;
  };

/** Every minion except the running one attacks a random character on the other side (a minion fights back; a hero does not), in play order. */
export const forceAllAttack = (): Effect => (ctx) => {
  const order = [...ctx.g.players['0'].board.map((m) => ({ owner: '0' as const, m })), ...ctx.g.players['1'].board.map((m) => ({ owner: '1' as const, m }))].sort(
    (a, b) => a.m.playSeq - b.m.playSeq
  );
  for (const { owner, m } of order) {
    if (m.instanceId === ctx.self || m.health <= 0) continue;
    const foe = opponentOf(owner);
    const targets: Parameters<typeof damageTarget>[1][] = [
      { kind: 'hero', player: foe },
      ...ctx.g.players[foe].board.filter((x) => x.health > 0).map((x) => ({ kind: 'minion' as const, instanceId: x.instanceId })),
    ];
    const t = targets[ctx.rng.int(targets.length)];
    const counter = t.kind === 'minion' ? findMinion(ctx.g, t.instanceId)?.minion.attack ?? 0 : 0;
    damageTarget(ctx.g, t, m.attack, ctx.events);
    if (counter > 0) damageTarget(ctx.g, { kind: 'minion', instanceId: m.instanceId }, counter, ctx.events);
  }
};

/** The selected friendly minions get "Demise: summon a random `race` minion costing `cost`". */
export const grantDeathSummon =
  (select: Selector, race: string, cost: number): Effect =>
  (ctx) => {
    for (const { owner, minion } of minionsOf(ctx, select)) {
      if (owner !== ctx.caster) continue;
      minion.deathSummons = [...(minion.deathSummons ?? []), { race, cost }];
    }
  };

/** Immune (takes no damage) until the end of this turn. */
export const grantImmune =
  (select: Selector): Effect =>
  (ctx) => {
    for (const { minion } of minionsOf(ctx, select)) minion.immune = true;
  };

/** The selected minions make their owner draw a card whenever they attack (for good). */
export const grantDrawOnAttack =
  (select: Selector): Effect =>
  (ctx) => {
    for (const { minion } of minionsOf(ctx, select)) minion.drawsOnAttack = true;
  };

/** The caster's next spell this turn costs `amount` less. */
export const setSpellDiscount =
  (amount: number): Effect =>
  (ctx) => {
    ctx.g.players[ctx.caster].spellDiscount = { turn: ctx.g.turn, amount };
  };

/** The opponent's spells cost nothing during their next turn. */
export const opponentSpellsFreeNextTurn = (): Effect => (ctx) => {
  ctx.g.players[opponentOf(ctx.caster)].freeSpellsOnTurn = ctx.g.turn + 1;
};

/** This turn the caster's minions cannot be reduced below 1 Health. */
export const healthFloorThisTurn = (): Effect => (ctx) => {
  ctx.g.players[ctx.caster].healthFloorOnTurn = ctx.g.turn;
};

/** Equips the running card's `index`-th entourage weapon token (replacing any weapon). */
export const equipTokenWeapon =
  (index = 0): Effect =>
  (ctx) => {
    const source = ctx.sourceCardId ? ctx.catalog.get(ctx.sourceCardId) : undefined;
    const token = source && ctx.catalog.get(source.entourage[index]);
    if (!token) throw new Error(`${ctx.sourceCardId} has no entourage weapon #${index} in the catalog`);
    ctx.g.players[ctx.caster].weapon = {
      instanceId: ctx.g.nextInstanceId++,
      cardId: token.id,
      attack: token.attack ?? 0,
      durability: token.health ?? 0,
    };
    ctx.events.push({ type: 'WeaponEquipped', player: ctx.caster, cardId: token.id });
  };

/** The running minion swaps places with a random minion card from its owner's hand (which goes onto the board in its slot; this card goes to the hand). */
export const swapSelfWithHandMinion = (): Effect => (ctx) => {
  const p = ctx.g.players[ctx.caster];
  const slot = p.board.findIndex((m) => m.instanceId === ctx.self);
  const options = p.hand.filter((c) => ctx.catalog.get(c.cardId)?.type === 'minion');
  if (slot < 0 || options.length === 0) return;
  const pick = ctx.rng.shuffle([...options])[0];
  const card = ctx.catalog.get(pick.cardId)!;
  const old = p.board[slot];
  p.hand = p.hand.filter((c) => c.instanceId !== pick.instanceId);
  p.hand.push({ instanceId: old.instanceId, cardId: old.cardId });
  const fresh = createMinion(card, pick.instanceId, ctx.g.turn, ctx.g.nextPlaySeq++);
  p.board[slot] = fresh;
  ctx.events.push({ type: 'MinionSummoned', player: ctx.caster, instanceId: fresh.instanceId, cardId: card.id });
};
