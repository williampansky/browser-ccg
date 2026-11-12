import { produce } from 'immer';
import { describeChanges, describeEvents, nameOfInstance } from '../describe-events';
import { createGame, createSeededRng } from '../../../engine';
import { catalogOf, minionCard, putOnBoard } from '../../../engine/testing/builders';
import { catalog as realCatalog, setup as realSetup } from '../../../engine/testing/real-cards';

const grunt = { ...minionCard('GRUNT'), name: 'Grunt' };
const catalog = catalogOf(grunt);
const state = () =>
  createGame({ decks: { '0': Array(30).fill('GRUNT'), '1': Array(30).fill('GRUNT') }, firstPlayer: '0' }, createSeededRng(1));

describe('describeEvents', () => {
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
        { type: 'MinionAttacked', attackerId: id, target: { kind: 'hero', player: '1' } },
        { type: 'HeroDamaged', player: '1', amount: 2 },
        { type: 'Drew', player: '0', instanceId: 1 },
        { type: 'GameOver', winner: '0' },
      ],
      catalog,
      s,
      s
    );
    expect(lines).toEqual(["__Grunt__ attacks **Player 2**'s hero", "  **Player 2**'s hero takes 2", '**Player 1** wins!']);
  });
  it('says what a spell was aimed at', () => {
    const s = putOnBoard(state(), '0', grunt);
    const id = s.players['0'].board[0].instanceId;
    const lines = describeEvents([{ type: 'CardPlayed', player: '1', instanceId: 5, cardId: 'GRUNT', target: { kind: 'minion', instanceId: id } }], catalog, s, s);
    expect(lines).toEqual(['**Player 2** casts __Grunt__ on __Grunt__']);
  });
});

describe('Spell Damage in the log', () => {
  const cast = (s: ReturnType<typeof realSetup>, id: string) =>
    describeEvents([{ type: 'CardPlayed', player: '0', instanceId: 5, cardId: id }], realCatalog, s, s);
  it('notes the caster\'s Spell Damage on a damage spell, so the log matches what the target took', () => {
    const boosted = realSetup('CORE_125', { mine: [[1, 1, 'CORE_011']] });
    expect(cast(boosted, 'CORE_125')).toEqual(['**Player 1** casts __' + realCatalog.get('CORE_125')!.name + '__ (+1 Spell Damage)']);
  });
  it('adds nothing without Spell Damage, for a silenced minion, or for a spell that does no damage', () => {
    expect(cast(realSetup('CORE_125'), 'CORE_125')[0]).not.toContain('Spell Damage');
    const silenced = produce(realSetup('CORE_125', { mine: [[1, 1, 'CORE_011']] }), (g) => void (g.players['0'].board[0].silenced = true));
    expect(cast(silenced, 'CORE_125')[0]).not.toContain('Spell Damage');
    const boosted = realSetup('CORE_043', { mine: [[1, 1, 'CORE_011']] });
    expect(cast(boosted, 'CORE_043')[0]).not.toContain('Spell Damage');
  });
});

describe('Mystery lines in the log', () => {
  const set = (player: '0' | '1', reveal: '0' | '1' | null) => {
    const s = realSetup('CORE_043');
    return describeEvents([{ type: 'CardPlayed', player, instanceId: 5, cardId: 'PRIME_143', mystery: true }], realCatalog, s, s, reveal);
  };
  const name = realCatalog.get('PRIME_143')!.name;
  it('names the Mystery to the player it belongs to, and to nobody else', () => {
    expect(set('0', '0')).toEqual([`**Player 1** sets a Mystery: __${name}__ (Attack)`]);
    expect(set('1', '0')).toEqual(['**Player 2** sets a Mystery (Attack)']); // the human cannot see the AI's
    expect(set('0', null)).toEqual(['**Player 1** sets a Mystery (Attack)']); // hot-seat: both players read the same log
  });
});

describe('describeChanges', () => {
  const base = putOnBoard(state(), '0', grunt);
  const change = (f: (m: ReturnType<typeof base.players['0']['board']['at']> & object) => void) =>
    produce(base, (g) => void f(g.players['0'].board[0]));
  it('reports a buff, a gained keyword (by its display name) and Disable', () => {
    const after = change((m) => {
      m.attack += 1;
      m.maxHealth += 2;
      m.health += 2;
      m.keywords.rush = true;
      m.disabledOnTurn = 9;
    });
    const [line] = describeChanges(base, after, catalog);
    expect(line).toContain('+1/+2');
    expect(line).toContain('gains Stampede');
    expect(line).toContain('is Disabled');
  });
  it('ignores aura attack and plain damage, and says nothing when nothing changed', () => {
    expect(describeChanges(base, change((m) => { m.attack += 1; m.auraAttack += 1; }), catalog)).toEqual([]);
    expect(describeChanges(base, change((m) => { m.health -= 1; }), catalog)).toEqual([]);
    expect(describeChanges(base, base, catalog)).toEqual([]);
  });
});
