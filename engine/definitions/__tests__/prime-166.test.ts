import { produce } from 'immer';
import { minion, play, setup } from '../../testing/real-cards';

const SPRITE_LANCER = 'CORE_004';
const LANCER_ATTACK = 2;
const LANCER_HEALTH = 1;
const WEAPON_DURABILITY = 5;

describe('PRIME_166', () => {
  it('gives a minion you summon +1/+1 and loses 1 Durability', () => {
    const start = setup('PRIME_166', { hand: [SPRITE_LANCER] });
    const armed = play(start).state;
    const summoned = play(armed).state;

    expect(armed.players['0'].weapon?.durability).toBe(WEAPON_DURABILITY);
    expect(minion(summoned, '0', 0).attack).toBe(LANCER_ATTACK + 1);
    expect(minion(summoned, '0', 0).health).toBe(LANCER_HEALTH + 1);
    expect(summoned.players['0'].weapon?.durability).toBe(
      WEAPON_DURABILITY - 1,
    );
  });

  it('breaks when its last Durability is spent', () => {
    const start = setup('PRIME_166', { hand: [SPRITE_LANCER] });
    const armed = play(start).state;
    const worn = produce(armed, (g) => {
      g.players['0'].weapon!.durability = 1;
    });
    const summoned = play(worn).state;

    expect(summoned.players['0'].weapon).toBeNull();
    expect(minion(summoned, '0', 0).attack).toBe(LANCER_ATTACK + 1);
  });
});
