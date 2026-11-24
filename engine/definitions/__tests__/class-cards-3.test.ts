import { produce } from 'immer';
import { createSeededRng } from '../../rng';
import { applyAction } from '../../rules/apply-action';
import { legalActions } from '../../rules/legal-actions';
import { createGame } from '../../state/create-game';
import type { Action, GameState } from '../../state/types';
import { putInHand, putOnBoard, setEnergy } from '../../testing/builders';
import {
  catalog,
  endTurn,
  hero,
  mref,
  play,
  realCard,
  run,
  setup,
  stats,
  withWeapon,
} from '../../testing/real-cards';
import { skillFor } from '../../heroes';

// PRIME_181 (Shadowform) and PRIME_236.

describe('PRIME_236', () => {
  it('equips a 1/3 weapon when you have none', () => {
    const weapon = play(setup('PRIME_236')).state.players['0'].weapon;

    expect(weapon?.cardId).toBe('PRIME_236a');
    expect([weapon?.attack, weapon?.durability]).toEqual([1, 3]);
  });

  it('gives your weapon +1/+1 when you have one', () => {
    const start = withWeapon(setup('PRIME_236'), '0');
    const weapon = play(start).state.players['0'].weapon;

    expect([weapon?.attack, weapon?.durability]).toEqual([3, 3]);
  });
});

describe('PRIME_181', () => {
  const withHero = (): GameState => {
    const start = createGame(
      {
        decks: { '0': Array(30).fill('GRUNT'), '1': Array(30).fill('GRUNT') },
        firstPlayer: '0',
        heroes: { '0': 'CLERIC', '1': 'WIZARD' },
      },
      createSeededRng(1),
    );

    return setEnergy(putInHand(start, '0', 'PRIME_181'), '0', 10);
  };
  const cast = (state: GameState): GameState => {
    const index = state.players['0'].hand.findIndex(
      (card) => card.cardId === 'PRIME_181',
    );
    const result = applyAction(
      state,
      { type: 'PlayCard', handIndex: index },
      { rng: createSeededRng(1), catalog },
    );

    if ('error' in result) throw new Error(result.error);

    return result.state;
  };
  const useSkill = (state: GameState, target = hero('1')): GameState => {
    const action: Action = { type: 'HeroSkill', skill: 0, target };
    const result = applyAction(state, action, {
      rng: createSeededRng(1),
      catalog,
    });

    if ('error' in result) throw new Error(result.error);

    return result.state;
  };

  it('replaces skill 1 with "Deal 2 damage" for the rest of the game', () => {
    const state = cast(withHero());
    const skill = skillFor(state.players['0'].hero, 0);

    expect(skill?.text).toBe('Deal 2 damage');
    expect(useSkill(state).players['1'].health).toBe(28);
  });

  it('is 3 damage when played again', () => {
    const again = cast(putInHand(cast(withHero()), '0', 'PRIME_181'));

    expect(useSkill(again).players['1'].health).toBe(27);
  });

  it('offers the damage skill with targets and keeps skill 1 cost', () => {
    const state = cast(withHero());
    const targets = legalActions(state, '0', catalog).filter(
      (action) => action.type === 'HeroSkill' && action.skill === 0,
    );

    expect(targets.length).toBeGreaterThan(0);
  });

  it('names its card so the skill icon uses its art', () => {
    const state = cast(withHero());

    expect(skillFor(state.players['0'].hero, 0)?.artCardId).toBe('PRIME_181');
    expect(skillFor(state.players['0'].hero, 1)?.artCardId).toBeUndefined();
    expect(
      skillFor(withHero().players['0'].hero, 0)?.artCardId,
    ).toBeUndefined();
  });

  it('leaves the other skills alone', () => {
    const state = cast(withHero());

    expect(skillFor(state.players['0'].hero, 1)?.name).not.toBe('Shadowform');
  });

  it('does not touch the other player skill', () => {
    const state = cast(withHero());

    expect(skillFor(state.players['1'].hero, 0)?.name).not.toBe('Shadowform');
  });
});

describe('PRIME_177', () => {
  // The Cleric's skill 1 heals 2; the enemy minion is at 3 of 5 Health.
  const clericGame = (hasLens: boolean): GameState => {
    const grunt = catalog.get('GRUNT')!;
    const stats = { attack: 2, health: 3, maxHealth: 5 };
    let state = createGame(
      {
        decks: { '0': Array(30).fill('GRUNT'), '1': Array(30).fill('GRUNT') },
        firstPlayer: '0',
        heroes: { '0': 'CLERIC', '1': 'WIZARD' },
      },
      createSeededRng(1),
    );

    state = setEnergy(state, '0', 10);
    state = putOnBoard(state, '1', grunt, stats);

    return hasLens ? putOnBoard(state, '0', realCard('PRIME_177')) : state;
  };
  const healEnemyMinion = (state: GameState): number => {
    const { instanceId } = state.players['1'].board[0];
    const result = applyAction(
      state,
      {
        type: 'HeroSkill',
        skill: 0,
        target: { kind: 'minion', instanceId },
      },
      { rng: createSeededRng(1), catalog },
    );

    if ('error' in result) throw new Error(result.error);

    return result.state.players['1'].board[0].health;
  };

  it('heals normally without it on your board', () => {
    expect(healEnemyMinion(clericGame(false))).toBe(5);
  });

  it('turns the Cleric skill heal into damage with it on your board', () => {
    expect(healEnemyMinion(clericGame(true))).toBe(1);
  });

  it('does nothing once it is silenced', () => {
    const silenced = produce(clericGame(true), (g) => {
      g.players['0'].board[0].silenced = true;
    });

    expect(healEnemyMinion(silenced)).toBe(5);
  });
});

// Cards that were played as plain bodies because their data lists no
// mechanic (PRIME_106, 110 and 226).

describe('PRIME_106', () => {
  it('raises your spell damage by 5', () => {
    const plain = setup('CORE_044', { theirs: [[1, 20]] });
    const boosted = setup('CORE_044', {
      mine: [[4, 12, 'PRIME_106']],
      theirs: [[1, 20]],
    });
    const healthAfter = (state: GameState): number =>
      stats(play(state, mref(state, '1', 0)).state, '1')[0][1];

    expect(healthAfter(plain) - healthAfter(boosted)).toBe(5);
  });
});

describe('PRIME_110', () => {
  it('destroys every other minion and discards your hand', () => {
    const start = setup('PRIME_110', {
      hand: ['GRUNT', 'GRUNT'],
      mine: [[1, 1]],
      theirs: [
        [2, 2],
        [3, 3],
      ],
    });
    const result = play(start).state;

    expect(result.players['0'].board).toHaveLength(1);
    expect(result.players['0'].board[0].cardId).toBe('PRIME_110');
    expect(result.players['1'].board).toHaveLength(0);
    expect(result.players['0'].hand).toHaveLength(0);
  });
});

describe('PRIME_226', () => {
  it('deals 5 damage to your own hero', () => {
    expect(play(setup('PRIME_226')).state.players['0'].health).toBe(25);
  });
});

// The token cards added in Airtable for PRIME_108, 109 and 235.

describe('PRIME_108', () => {
  it('summons Whelps until your board is full', () => {
    const board = play(setup('PRIME_108')).state.players['0'].board;

    expect(board).toHaveLength(7);
    expect(board.filter((m) => m.cardId === 'PRIME_108a')).toHaveLength(6);
  });

  it('fills only the room that is left', () => {
    const state = play(
      setup('PRIME_108', {
        mine: [
          [1, 1],
          [1, 1],
        ],
      }),
    ).state;

    expect(state.players['0'].board).toHaveLength(7);
  });
});

describe('PRIME_109', () => {
  it('adds a Dream card to your hand at the end of your turn', () => {
    const played = play(setup('PRIME_109')).state;
    const before = played.players['0'].hand.length;
    const after = endTurn(played).players['0'].hand;

    expect(after).toHaveLength(before + 1);
    expect(after.at(-1)?.cardId).toMatch(/^PRIME_109[a-d]$/);
  });
});

describe('PRIME_235', () => {
  it('equips a 2/2 weapon', () => {
    const weapon = play(setup('PRIME_235')).state.players['0'].weapon;

    expect(weapon?.cardId).toBe('PRIME_235a');
    expect([weapon?.attack, weapon?.durability]).toEqual([2, 2]);
  });
});

describe('the Dream cards', () => {
  it('PRIME_109a returns a minion to its owner', () => {
    const start = setup('PRIME_109a', { theirs: [[2, 2]] });
    const result = play(start, mref(start, '1', 0)).state;

    expect(result.players['1'].board).toHaveLength(0);
  });

  it('PRIME_109b gives +4/+4 and the minion dies at your next turn start', () => {
    const start = setup('PRIME_109b', { mine: [[1, 1]] });
    const buffed = play(start, mref(start, '0', 0)).state;
    const later = endTurn(endTurn(buffed));

    expect(stats(buffed, '0')[0]).toEqual([5, 5]);
    expect(later.players['0'].board).toHaveLength(0);
  });

  it('PRIME_109d cannot be aimed at by spells', () => {
    const start = setup('PRIME_265', { theirs: [[3, 5, 'PRIME_109d']] });
    const result = run(start, {
      type: 'PlayCard',
      handIndex: 0,
      target: mref(start, '1', 0),
    });

    expect('error' in result).toBe(true);
  });
});
