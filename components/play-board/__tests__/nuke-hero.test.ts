import { produce } from 'immer';
import { createGame, createSeededRng } from '../../../engine';
import { catalogOf, minionCard, putOnBoard, weaponCard } from '../../../engine/testing/builders';
import { nukeHero } from '../nuke-hero';

const grunt = minionCard('GRUNT', { attack: 2, health: 3 });
const mace = weaponCard('MACE', { attack: 3, durability: 2 });
const catalog = catalogOf(grunt, mace);

const start = () => {
  const rng = createSeededRng(1);
  const deck = Array.from({ length: 30 }, () => 'GRUNT');
  return createGame({ decks: { '0': deck, '1': deck }, firstPlayer: '0' }, rng);
};

describe('nukeHero', () => {
  it('swings twice with a doubleAttack minion', () => {
    let s = putOnBoard(start(), '0', grunt);
    s = produce(s, (g) => {
      g.players['0'].board[0].keywords.doubleAttack = true;
    });
    const r = nukeHero(s, '0', createSeededRng(2), catalog);
    expect(r.steps.filter((x) => x.action.type === 'Attack')).toHaveLength(2);
    expect(r.state.players['1'].health).toBe(s.players['1'].health - 4);
  });

  it('also swings the equipped weapon at the hero', () => {
    const s = produce(putOnBoard(start(), '0', grunt), (g) => {
      g.players['0'].weapon = { cardId: 'MACE', attack: 3, durability: 2 } as never;
    });
    const r = nukeHero(s, '0', createSeededRng(2), catalog);
    expect(r.steps.map((x) => x.action.type)).toEqual(['Attack', 'WeaponAttack']);
    expect(r.state.players['1'].health).toBe(s.players['1'].health - 5);
  });
});
