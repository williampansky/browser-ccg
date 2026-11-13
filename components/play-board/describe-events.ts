import { getCardDef, heroSkill } from '../../engine';
import type { CardCatalog, GameEvent, GameState, MinionInstance, TargetRef } from '../../engine';

export const MYSTERY_CATEGORY_LABEL = { attack: 'Attack', spell: 'Spell', minion: 'Minion', damage: 'Damage', death: 'Death' } as const;

/** What the opponent is told about a face-down Mystery: its category only. */
/** What a face-down Mystery of this category will react to, as told to the player it is set against. */
export const MYSTERY_HINT = {
  attack: 'Reacts when you attack.',
  spell: 'Reacts when you cast a spell.',
  minion: 'Reacts when you play a minion.',
  damage: 'Reacts when its hero takes damage.',
  death: 'Reacts when one of its minions dies.',
} as const;

export const mysteryCategory = (cardId: string, catalog: CardCatalog): string => {
  const c = catalog.get(cardId);
  const cat = c && getCardDef(c)?.mystery?.category;
  return cat ? MYSTERY_CATEGORY_LABEL[cat] : '?';
};

/** Finds a card name for an instance id, looking in every state given (an instance may have died). */
export const nameOfInstance = (id: number, catalog: CardCatalog, ...states: GameState[]): string => {
  for (const s of states) {
    for (const p of ['0', '1'] as const) {
      const pl = s.players[p];
      const found = [...pl.board, ...pl.hand, ...pl.deck].find((x) => x.instanceId === id);
      if (found) return catalog.get(found.cardId)?.name ?? found.cardId;
    }
  }
  return `minion #${id}`;
};

/** Log markup: `**Player 1**` is a player (coloured by side), `__Card__` is a card name (bold italic). */
const who = (p: '0' | '1') => `**Player ${Number(p) + 1}**`;
const card = (name: string) => `__${name}__`;

/** Turns the events of one action into short log lines. Events with no player-facing meaning are skipped. */
export const describeEvents = (
  events: GameEvent[],
  catalog: CardCatalog,
  before: GameState,
  after: GameState,
  /** Whose face-down Mystery cards may be named in the log (the human player's, against the AI); null names nobody's, as in hot-seat */
  reveal: '0' | '1' | null = null
): string[] => {
  const name = (id: number) => card(nameOfInstance(id, catalog, before, after));
  const cardName = (id: string) => card(catalog.get(id)?.name ?? id);
  const target = (t: TargetRef) => (t.kind === 'hero' ? `${who(t.player)}'s hero` : name(t.instanceId));
  /** " (+1 Spell Damage)" when the caster had Spell Damage and the spell deals damage or heals (the card's own text shows the base numbers). */
  const spellDamageNote = (player: '0' | '1', cardId: string): string => {
    const c = catalog.get(cardId);
    if (!c || c.type !== 'spell' || !/damage|heal|restore/i.test(c.text)) return '';
    const bonus = before.players[player].board.reduce((sum, m) => {
      const mc = catalog.get(m.cardId);
      return sum + (m.silenced || !mc ? 0 : getCardDef(mc)?.spellDamage ?? 0);
    }, 0);
    return bonus > 0 ? ` (+${bonus} Spell Damage)` : '';
  };
  const lines: string[] = [];
  for (const e of events) {
    switch (e.type) {
      case 'TurnStarted':
        lines.push(`--- Turn ${e.turn}: ${who(e.player)} ---`);
        break;
      case 'MinionPlayed':
        lines.push(`${who(e.player)} plays ${name(e.instanceId)}${e.target ? ` (warcry on ${target(e.target)})` : ''}`);
        break;
      case 'CardPlayed':
        if (e.mystery) {
          lines.push(
            e.player === reveal
              ? `${who(e.player)} sets a Mystery: ${cardName(e.cardId)} (${mysteryCategory(e.cardId, catalog)})`
              : `${who(e.player)} sets a Mystery (${mysteryCategory(e.cardId, catalog)})`
          );
          break;
        }
        lines.push(
          `${who(e.player)} casts ${cardName(e.cardId)}${e.target ? ` on ${target(e.target)}` : ''}${spellDamageNote(e.player, e.cardId)}`
        );
        break;
      case 'HeroSkillUsed': {
        const skill = heroSkill(after.players[e.player].hero?.id, e.skill);
        lines.push(`${who(e.player)} uses ${card(skill?.name ?? 'a hero skill')}${e.target ? ` on ${target(e.target)}` : ''}`);
        break;
      }
      case 'MysteryRevealed':
        lines.push(`${who(e.player)}'s Mystery is revealed: ${cardName(e.cardId)}`);
        break;
      case 'WeaponEquipped':
        lines.push(`${who(e.player)} equips ${cardName(e.cardId)}`);
        break;
      case 'MinionSummoned':
        if (!events.some((x) => x.type === 'MinionPlayed' && x.instanceId === e.instanceId)) {
          lines.push(`${cardName(e.cardId)} is summoned for ${who(e.player)}`);
        }
        break;
      case 'MinionAttacked':
        lines.push(`${name(e.attackerId)} attacks ${target(e.target)}`);
        break;
      case 'WeaponAttacked':
        lines.push(`Hero attacks ${target(e.target)} with its weapon`);
        break;
      case 'MinionDamaged':
        lines.push(`  ${name(e.instanceId)} takes ${e.amount}`);
        break;
      case 'HeroDamaged':
        lines.push(`  ${who(e.player)}'s hero takes ${e.amount}`);
        break;
      case 'Healed':
        lines.push(`  ${target(e.target)} heals ${e.amount}`);
        break;
      case 'BubblePopped':
        lines.push(`  ${name(e.instanceId)}'s Bubble pops`);
        break;
      case 'Fatigue':
        lines.push(`${who(e.player)} has no cards left: fatigue ${e.damage}`);
        break;
      case 'Burned':
        lines.push(`${who(e.player)}'s hand is full: a card is burned`);
        break;
      case 'Discarded':
        lines.push(`${who(e.player)} discards a card`);
        break;
      case 'ArmorGained':
        lines.push(`  ${who(e.player)} gains ${e.amount} armor`);
        break;
      case 'WeaponBroke':
        lines.push(`${who(e.player)}'s weapon breaks`);
        break;
      case 'MinionDied':
        lines.push(`  ${cardName(e.cardId)} dies`);
        break;
      case 'GameOver':
        lines.push(e.winner === 'draw' ? 'Draw!' : `${who(e.winner)} wins!`);
        break;
      default:
        break;
    }
  }
  // Changes that have no event of their own (buffs, keywords, Disable, ...) are read from the before/after states.
  // At turn changes "this turn" boosts wear off, which would only be noise, so skip those.
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

/** Lines for minions that changed between two states in ways no event reports. Aura attack is ignored. */
export const describeChanges = (before: GameState, after: GameState, catalog: CardCatalog): string[] => {
  const lines: string[] = [];
  for (const p of ['0', '1'] as const) {
    for (const now of after.players[p].board) {
      const was = before.players[p].board.find((m) => m.instanceId === now.instanceId);
      if (!was) continue;
      const parts: string[] = [];
      const atk = now.attack - now.auraAttack - (was.attack - was.auraAttack);
      const hp = now.maxHealth - was.maxHealth;
      if (atk !== 0 || hp !== 0) parts.push(`${atk >= 0 ? '+' : ''}${atk}/${hp >= 0 ? '+' : ''}${hp} (now ${now.attack}/${now.health})`);
      for (const k of Object.keys(KEYWORD_NAMES) as (keyof typeof KEYWORD_NAMES)[]) {
        if (now.keywords[k] && !was.keywords[k] && !(k === 'rush' && now.auraRush)) parts.push(`gains ${KEYWORD_NAMES[k]}`);
        if (!now.keywords[k] && was.keywords[k] && k !== 'hidden' && k !== 'bubble') parts.push(`loses ${KEYWORD_NAMES[k]}`);
      }
      if (now.disabledOnTurn !== undefined && now.disabledOnTurn !== was.disabledOnTurn) parts.push('is Disabled');
      if (parts.length > 0) {
        lines.push(`  ${card(catalog.get(now.cardId)?.name ?? now.cardId)}: ${parts.join(', ')}`);
      }
    }
    const [h0, h1] = [before.players[p].heroDisabledOnTurn, after.players[p].heroDisabledOnTurn];
    if (h1 !== undefined && h1 !== h0) lines.push(`  ${who(p)}'s hero is Disabled`);
  }
  return lines;
};
