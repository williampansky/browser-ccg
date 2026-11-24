import { produce } from 'immer';
import {
  describeChanges,
  describeEvents,
  nameOfInstance,
} from '../describe-events';
import { plainLogText } from '../log-line';
import { createGame, createSeededRng } from '../../../engine';
import {
  catalogOf,
  minionCard,
  putOnBoard,
} from '../../../engine/testing/builders';
import {
  catalog as realCatalog,
  setup as realSetup,
} from '../../../engine/testing/real-cards';

const grunt = { ...minionCard('GRUNT'), name: 'Grunt' };
const catalog = catalogOf(grunt);
const state = () =>
  createGame(
    {
      decks: { '0': Array(30).fill('GRUNT'), '1': Array(30).fill('GRUNT') },
      firstPlayer: '0',
    },
    createSeededRng(1),
  );

describe('describeEvents', () => {
  it('names the card behind a trigger or an On Death effect', () => {
    const lines = describeEvents(
      [
        { type: 'TriggerFired', player: '0', cardId: 'GRUNT' },
        { type: 'TriggerFired', player: '0', cardId: 'GRUNT', isDeath: true },
      ],
      catalog,
      state(),
      state(),
    );

    expect(lines.map(plainLogText)).toEqual([
      'Grunt triggers',
      'Grunt On Death',
    ]);
    expect(lines.every((line) => line.kind === 'action')).toBe(true);
  });

  it('names minions from either the before or the after state', () => {
    const s = putOnBoard(state(), '0', grunt);
    const id = s.players['0'].board[0].instanceId;
    expect(nameOfInstance(id, catalog, s)).toBe('Grunt');
    expect(nameOfInstance(id, catalog, state(), s)).toBe('Grunt');
    expect(nameOfInstance(9999, catalog, s)).toBe('minion #9999');
  });
  it('writes readable lines and skips events with no player-facing meaning', () => {
    const s = putOnBoard(state(), '0', grunt);
    const id = s.players['0'].board[0].instanceId;
    const lines = describeEvents(
      [
        {
          type: 'MinionAttacked',
          attackerId: id,
          target: { kind: 'hero', player: '1' },
        },
        { type: 'HeroDamaged', player: '1', amount: 2 },
        { type: 'Drew', player: '0', instanceId: 1 },
        { type: 'GameOver', winner: '0' },
      ],
      catalog,
      s,
      s,
    );
    expect(lines.map((line) => [line.kind, plainLogText(line)])).toEqual([
      ['action', "Grunt attacks Player 2's hero"],
      ['effect', "Player 2's hero"],
      ['info', 'Player 1 wins!'],
    ]);
    expect(lines[0].actor).toBe('0');
    expect(lines[1]).toMatchObject({
      tone: 'damage',
      amount: '-2',
      note: '28 left',
    });
  });
  it('says what a spell was aimed at', () => {
    const s = putOnBoard(state(), '0', grunt);
    const id = s.players['0'].board[0].instanceId;
    const lines = describeEvents(
      [
        {
          type: 'CardPlayed',
          player: '1',
          instanceId: 5,
          cardId: 'GRUNT',
          target: { kind: 'minion', instanceId: id },
        },
      ],
      catalog,
      s,
      s,
    );
    expect(lines).toHaveLength(1);
    expect(lines[0].actor).toBe('1');
    expect(plainLogText(lines[0])).toBe('casts Grunt on Grunt');
  });
});

describe('Spell Damage in the log', () => {
  const cast = (s: ReturnType<typeof realSetup>, id: string) =>
    describeEvents(
      [{ type: 'CardPlayed', player: '0', instanceId: 5, cardId: id }],
      realCatalog,
      s,
      s,
    );
  it("notes the caster's Spell Damage on a damage spell, so the log matches what the target took", () => {
    const boosted = realSetup('CORE_125', { mine: [[1, 1, 'CORE_011']] });
    expect(cast(boosted, 'CORE_125')[0]).toMatchObject({
      note: '+1 Spell Damage',
    });
  });
  it('adds nothing without Spell Damage, for a silenced minion, or for a spell that does no damage', () => {
    expect(cast(realSetup('CORE_125'), 'CORE_125')[0].note).toBeUndefined();
    const silenced = produce(
      realSetup('CORE_125', { mine: [[1, 1, 'CORE_011']] }),
      (g) => void (g.players['0'].board[0].silenced = true),
    );
    expect(cast(silenced, 'CORE_125')[0].note).toBeUndefined();
    const boosted = realSetup('CORE_043', { mine: [[1, 1, 'CORE_011']] });
    expect(cast(boosted, 'CORE_043')[0].note).toBeUndefined();
  });
});

describe('Mystery lines in the log', () => {
  const set = (player: '0' | '1', reveal: '0' | '1' | null) => {
    const s = realSetup('CORE_043');
    return describeEvents(
      [
        {
          type: 'CardPlayed',
          player,
          instanceId: 5,
          cardId: 'PRIME_143',
          mystery: true,
        },
      ],
      realCatalog,
      s,
      s,
      reveal,
    );
  };
  const name = realCatalog.get('PRIME_143')!.name;
  it('names the Mystery to the player it belongs to, and to nobody else', () => {
    const text = (player: '0' | '1', reveal: '0' | '1' | null) =>
      set(player, reveal).map((line) => [plainLogText(line), line.note]);
    expect(text('0', '0')).toEqual([[`sets a Mystery: ${name}`, 'Attack']]);
    expect(text('1', '0')).toEqual([['sets a Mystery', 'Attack']]); // the human cannot see the AI's
    expect(text('0', null)).toEqual([['sets a Mystery', 'Attack']]); // hot-seat: both players read the same log
  });
});

describe('describeChanges', () => {
  const base = putOnBoard(state(), '0', grunt);
  const change = (
    f: (
      m: ReturnType<(typeof base.players)['0']['board']['at']> & object,
    ) => void,
  ) => produce(base, (g) => void f(g.players['0'].board[0]));
  it('reports a buff, a gained keyword (by its display name) and Disable', () => {
    const after = change((m) => {
      m.attack += 1;
      m.maxHealth += 2;
      m.health += 2;
      m.keywords.rush = true;
      m.disabledOnTurn = 9;
    });
    const [line] = describeChanges(base, after, catalog);
    expect(line.amount).toBe('+1/+2');
    expect(line.note).toContain('gains Stampede');
    expect(line.note).toContain('is Disabled');
  });
  it('ignores aura attack and plain damage, and says nothing when nothing changed', () => {
    expect(
      describeChanges(
        base,
        change((m) => {
          m.attack += 1;
          m.auraAttack += 1;
        }),
        catalog,
      ),
    ).toEqual([]);
    expect(
      describeChanges(
        base,
        change((m) => {
          m.health -= 1;
        }),
        catalog,
      ),
    ).toEqual([]);
    expect(describeChanges(base, base, catalog)).toEqual([]);
  });
});
