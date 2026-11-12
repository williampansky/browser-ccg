import { createGame, createSeededRng } from '../../../engine';
import { catalogOf, minionCard, spellCard, weaponCard } from '../../../engine/testing/builders';
import { applyDebugSetup } from '../debug-setup';

const grunt = minionCard('GRUNT', { attack: 2, health: 3 });
const mace = weaponCard('MACE', { attack: 3, durability: 2 });
const bolt = spellCard('BOLT');
const catalog = catalogOf(grunt, mace, bolt);
const start = () => {
  const deck = Array.from({ length: 30 }, () => 'GRUNT');
  return createGame({ decks: { '0': deck, '1': deck }, firstPlayer: '0' }, createSeededRng(1));
};

describe('applyDebugSetup', () => {
  it('places ready minions and a weapon, skipping unusable ids', () => {
    const s = applyDebugSetup(
      start(),
      { boards: { '0': ['GRUNT', 'BOLT', 'NOPE', 'GRUNT'], '1': [] }, weapons: { '0': 'MACE', '1': 'GRUNT' }, energy: { '0': 7, '1': undefined } },
      catalog
    );
    expect(s.players['0'].board.map((m) => m.cardId)).toEqual(['GRUNT', 'GRUNT']);
    expect(new Set(s.players['0'].board.map((m) => m.instanceId)).size).toBe(2);
    expect(s.players['0'].board[0].playedOnTurn).toBe(0);
    expect(s.players['0'].weapon).toMatchObject({ cardId: 'MACE', attack: 3, durability: 2 });
    expect(s.players['1'].weapon).toBeFalsy();
    expect(s.players['0'].energy).toEqual({ current: 7, total: 7 });
    expect(s.players['1'].energy).toEqual(start().players['1'].energy);
  });
});
