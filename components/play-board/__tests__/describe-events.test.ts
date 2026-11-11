import { describeEvents, nameOfInstance } from '../describe-events';
import { createGame, createSeededRng } from '../../../engine';
import { catalogOf, minionCard, putOnBoard } from '../../../engine/testing/builders';

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
    expect(lines).toEqual(["Grunt attacks Player 2's hero", "  Player 2's hero takes 2", 'Player 1 wins!']);
  });
});
