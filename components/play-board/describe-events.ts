import { getCardDef, heroSkill } from '../../engine';
import type { LogLine } from './log-line';
import { MAX_HEALTH } from '../../engine/state/types';
import type {
  CardCatalog,
  GameEvent,
  GameState,
  MinionInstance,
  TargetRef,
} from '../../engine';

export const MYSTERY_CATEGORY_LABEL = {
  attack: 'Attack',
  spell: 'Spell',
  minion: 'Minion',
  damage: 'Damage',
  death: 'Death',
} as const;

/** What the opponent is told about a face-down Mystery: its category only. */
/**
 * What a face-down Mystery of this category will react to, as told to the
 * player it is set against.
 */
export const MYSTERY_HINT = {
  attack: 'Reacts when you attack.',
  spell: 'Reacts when you cast a spell.',
  minion: 'Reacts when you play a minion.',
  damage: 'Reacts when its hero takes damage.',
  death: 'Reacts when one of its minions dies.',
} as const;

export const mysteryCategory = (
  cardId: string,
  catalog: CardCatalog,
): string => {
  const c = catalog.get(cardId);
  const cat = c && getCardDef(c)?.mystery?.category;
  return cat ? MYSTERY_CATEGORY_LABEL[cat] : '?';
};

/**
 * Finds a card name for an instance id, looking in every state given (an
 * instance may have died).
 */
export const nameOfInstance = (
  id: number,
  catalog: CardCatalog,
  ...states: GameState[]
): string => {
  for (const s of states) {
    for (const p of ['0', '1'] as const) {
      const pl = s.players[p];
      const found = [...pl.board, ...pl.hand, ...pl.deck].find(
        (x) => x.instanceId === id,
      );
      if (found) return catalog.get(found.cardId)?.name ?? found.cardId;
    }
  }
  return `minion #${id}`;
};

/**
 * Log markup: `**Player 1**` is a player (coloured by side), `__0|Card__` is a
 * card name owned by side 0 (`__Card__` has no owner).
 */
const who = (p: '0' | '1') => `**Player ${Number(p) + 1}**`;
const card = (name: string, owner?: '0' | '1') =>
  owner ? `__${owner}|${name}__` : `__${name}__`;

/**
 * The symbol on each kind of log line. Emoji for now; swap them here for
 * in-theme icons later (nothing else reads these).
 */
export const LOG_ICON = {
  play: '🃏',
  spell: '✨',
  skill: '🔆',
  attack: '⚔️',
  trigger: '⚡',
  equip: '🗡️',
  mystery: '❓',
  summon: '➕',
  death: '💀',
  bubble: '🫧',
  armor: '🛡️',
  burn: '🔥',
  fatigue: '😵',
  win: '🏆',
  weaponBreak: '💥',
} as const;

/**
 * Turns the events of one action into log lines: a line for what happened
 * and indented results under it. Events with no player-facing meaning are
 * skipped.
 */
export const describeEvents = (
  events: GameEvent[],
  catalog: CardCatalog,
  before: GameState,
  after: GameState,
  /**
   * Whose face-down Mystery cards may be named in the log (the human player's,
   * against the AI); null names nobody's, as in hot-seat
   */
  reveal: '0' | '1' | null = null,
): LogLine[] => {
  /** Whose minion this is, found in either state (it may have died). */
  const ownerOf = (id: number): '0' | '1' | undefined => {
    for (const state of [before, after]) {
      for (const side of ['0', '1'] as const) {
        const { board } = state.players[side];
        if (board.some((m) => m.instanceId === id)) return side;
      }
    }
    return undefined;
  };
  const name = (id: number) =>
    card(nameOfInstance(id, catalog, before, after), ownerOf(id));
  const cardName = (id: string, owner?: '0' | '1') =>
    card(catalog.get(id)?.name ?? id, owner);
  const target = (t: TargetRef) =>
    t.kind === 'hero' ? `${who(t.player)}'s hero` : name(t.instanceId);
  /**
   * " (+1 Spell Damage)" when the caster had Spell Damage and the spell deals
   * damage or heals (the card's own text shows the base numbers).
   */
  const spellDamageNote = (player: '0' | '1', cardId: string): string => {
    const c = catalog.get(cardId);
    if (!c || c.type !== 'spell' || !/damage|heal|restore/i.test(c.text))
      return '';
    const bonus = before.players[player].board.reduce((sum, m) => {
      const mc = catalog.get(m.cardId);
      return sum + (m.silenced || !mc ? 0 : (getCardDef(mc)?.spellDamage ?? 0));
    }, 0);
    return bonus > 0 ? `+${bonus} Spell Damage` : '';
  };
  // Running health, so a damage line can say what is left. Heroes' armor
  // soaks damage first, as in the engine.
  const heroes = {
    '0': { hp: before.players['0'].health, armor: before.players['0'].armor },
    '1': { hp: before.players['1'].health, armor: before.players['1'].armor },
  };
  const minionHp = new Map<number, { hp: number; max: number }>();
  for (const side of ['0', '1'] as const) {
    for (const m of before.players[side].board) {
      minionHp.set(m.instanceId, { hp: m.health, max: m.maxHealth });
    }
  }
  const lines: LogLine[] = [];
  const action = (
    actor: '0' | '1' | undefined,
    icon: string,
    text: string,
    note?: string,
  ) =>
    lines.push({ kind: 'action', actor, icon, text, note: note || undefined });
  const effect = (line: Omit<LogLine, 'kind'>) =>
    lines.push({ kind: 'effect', ...line });
  for (const e of events) {
    switch (e.type) {
      case 'TurnStarted':
        lines.push({ kind: 'turn', actor: e.player, text: `Turn ${e.turn}` });
        break;
      case 'MinionPlayed':
        action(
          e.player,
          LOG_ICON.play,
          `plays ${name(e.instanceId)}${e.target ? ` on ${target(e.target)}` : ''}`,
        );
        break;
      case 'CardPlayed':
        if (e.mystery) {
          const category = mysteryCategory(e.cardId, catalog);
          action(
            e.player,
            LOG_ICON.mystery,
            e.player === reveal
              ? `sets a Mystery: ${cardName(e.cardId, e.player)}`
              : 'sets a Mystery',
            category,
          );
          break;
        }
        action(
          e.player,
          LOG_ICON.spell,
          `casts ${cardName(e.cardId, e.player)}${e.target ? ` on ${target(e.target)}` : ''}`,
          spellDamageNote(e.player, e.cardId),
        );
        break;
      case 'HeroSkillUsed': {
        const skill = heroSkill(after.players[e.player].hero?.id, e.skill);
        action(
          e.player,
          LOG_ICON.skill,
          `uses ${card(skill?.name ?? 'a hero skill', e.player)}${e.target ? ` on ${target(e.target)}` : ''}`,
        );
        break;
      }
      case 'MysteryRevealed':
        action(
          e.player,
          LOG_ICON.mystery,
          `Mystery revealed: ${cardName(e.cardId, e.player)}`,
        );
        break;
      case 'WeaponEquipped':
        action(
          e.player,
          LOG_ICON.equip,
          `equips ${cardName(e.cardId, e.player)}`,
        );
        break;
      case 'MinionSummoned':
        if (
          !events.some(
            (x) => x.type === 'MinionPlayed' && x.instanceId === e.instanceId,
          )
        ) {
          effect({
            actor: e.player,
            icon: LOG_ICON.summon,
            tone: 'note',
            text: `${cardName(e.cardId, e.player)} summoned`,
          });
        }
        break;
      case 'MinionAttacked':
        action(
          ownerOf(e.attackerId),
          LOG_ICON.attack,
          `${name(e.attackerId)} attacks ${target(e.target)}`,
        );
        break;
      case 'WeaponAttacked':
        action(
          before.activePlayer,
          LOG_ICON.attack,
          `hero attacks ${target(e.target)} with its weapon`,
        );
        break;
      case 'MinionDamaged': {
        const known = minionHp.get(e.instanceId);
        if (known) known.hp = Math.max(0, known.hp - e.amount);
        effect({
          actor: e.player,
          tone: 'damage',
          amount: `-${e.amount}`,
          text: name(e.instanceId),
          note: known && known.hp > 0 ? `${known.hp} left` : undefined,
        });
        break;
      }
      case 'HeroDamaged': {
        const hero = heroes[e.player];
        const absorbed = Math.min(hero.armor, e.amount);
        hero.armor -= absorbed;
        hero.hp = Math.max(0, hero.hp - (e.amount - absorbed));
        const notes = [
          absorbed > 0 ? `${absorbed} absorbed` : '',
          hero.hp > 0 ? `${hero.hp} left` : 'dead',
        ].filter(Boolean);
        effect({
          actor: e.player,
          tone: 'damage',
          amount: `-${e.amount}`,
          text: `${who(e.player)}'s hero`,
          note: notes.join(', '),
        });
        break;
      }
      case 'Healed': {
        let note: string | undefined;
        if (e.target.kind === 'hero') {
          const hero = heroes[e.target.player];
          hero.hp = Math.min(MAX_HEALTH, hero.hp + e.amount);
          note = `${hero.hp} left`;
        } else {
          const known = minionHp.get(e.target.instanceId);
          if (known) known.hp = Math.min(known.max, known.hp + e.amount);
        }
        effect({
          actor:
            e.target.kind === 'hero'
              ? e.target.player
              : ownerOf(e.target.instanceId),
          tone: 'heal',
          amount: `+${e.amount}`,
          text: target(e.target),
          note,
        });
        break;
      }
      case 'BubblePopped':
        effect({
          actor: ownerOf(e.instanceId),
          icon: LOG_ICON.bubble,
          tone: 'note',
          text: `${name(e.instanceId)} Bubble pops`,
        });
        break;
      case 'Fatigue':
        action(
          e.player,
          LOG_ICON.fatigue,
          'out of cards: fatigue',
          `${e.damage}`,
        );
        break;
      case 'Burned':
        action(e.player, LOG_ICON.burn, 'hand is full: a card is burned');
        break;
      case 'Discarded':
        action(e.player, LOG_ICON.burn, 'discards a card');
        break;
      case 'ArmorGained':
        heroes[e.player].armor += e.amount;
        effect({
          actor: e.player,
          tone: 'armor',
          amount: `+${e.amount}`,
          text: `${who(e.player)}'s hero`,
          note: 'armor',
        });
        break;
      case 'WeaponBroke':
        effect({
          actor: e.player,
          icon: LOG_ICON.weaponBreak,
          tone: 'death',
          text: 'weapon breaks',
        });
        break;
      case 'TriggerFired':
        action(
          e.player,
          LOG_ICON.trigger,
          `${cardName(e.cardId, e.player)} ${e.isDeath ? 'On Death' : 'triggers'}`,
        );
        break;
      case 'MinionDied':
        effect({
          actor: e.player,
          icon: LOG_ICON.death,
          tone: 'death',
          text: `${cardName(e.cardId, e.player)} dies`,
        });
        break;
      case 'GameOver':
        lines.push({
          kind: 'info',
          icon: LOG_ICON.win,
          text: e.winner === 'draw' ? 'Draw!' : `${who(e.winner)} wins!`,
        });
        break;
      default:
        break;
    }
  }
  // Changes that have no event of their own (buffs, keywords, Disable, ...) are
  // read from the before/after states.
  // At turn changes "this turn" boosts wear off, which would only be noise, so
  // skip those.
  if (!events.some((e) => e.type === 'TurnEnded' || e.type === 'TurnStarted')) {
    lines.push(...describeChanges(before, after, catalog));
  }
  return lines;
};

const KEYWORD_NAMES: Record<keyof MinionInstance['keywords'], string> = {
  guard: 'Guard',
  rush: 'Stampede',
  bubble: 'Bubble',
  doubleAttack: 'Onslaught',
  hidden: 'Concealed',
  noAttack: "Can't Attack",
};

/**
 * Result lines for minions that changed between two states in ways no event
 * reports. Aura attack is ignored.
 */
export const describeChanges = (
  before: GameState,
  after: GameState,
  catalog: CardCatalog,
): LogLine[] => {
  const lines: LogLine[] = [];
  for (const side of ['0', '1'] as const) {
    for (const now of after.players[side].board) {
      const was = before.players[side].board.find(
        (m) => m.instanceId === now.instanceId,
      );
      if (!was) continue;
      const notes: string[] = [];
      const atk = now.attack - now.auraAttack - (was.attack - was.auraAttack);
      const hp = now.maxHealth - was.maxHealth;
      const stats =
        atk !== 0 || hp !== 0
          ? `${atk >= 0 ? '+' : ''}${atk}/${hp >= 0 ? '+' : ''}${hp}`
          : undefined;
      if (stats) notes.push(`now ${now.attack}/${now.health}`);
      let isLoss = false;
      for (const k of Object.keys(
        KEYWORD_NAMES,
      ) as (keyof typeof KEYWORD_NAMES)[]) {
        if (
          now.keywords[k] &&
          !was.keywords[k] &&
          !(k === 'rush' && now.auraRush)
        )
          notes.push(`gains ${KEYWORD_NAMES[k]}`);
        if (
          !now.keywords[k] &&
          was.keywords[k] &&
          k !== 'hidden' &&
          k !== 'bubble'
        ) {
          notes.push(`loses ${KEYWORD_NAMES[k]}`);
          isLoss = true;
        }
      }
      const isDisabled =
        now.disabledOnTurn !== undefined &&
        now.disabledOnTurn !== was.disabledOnTurn;
      if (isDisabled) notes.push('is Disabled');
      if (notes.length === 0) continue;
      lines.push({
        kind: 'effect',
        actor: side,
        tone: isLoss || isDisabled ? 'debuff' : 'buff',
        amount: stats,
        text: card(catalog.get(now.cardId)?.name ?? now.cardId, side),
        note: notes.join(', '),
      });
    }
    const [wasOff, isOff] = [
      before.players[side].heroDisabledOnTurn,
      after.players[side].heroDisabledOnTurn,
    ];
    if (isOff !== undefined && isOff !== wasOff) {
      lines.push({
        kind: 'effect',
        actor: side,
        tone: 'debuff',
        text: `${who(side)}'s hero`,
        note: 'is Disabled',
      });
    }
  }
  return lines;
};
