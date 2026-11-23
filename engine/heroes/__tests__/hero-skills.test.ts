import { produce } from 'immer';
import { loadHsCards } from '../../cards/load-hs-cards';
import { createSeededRng } from '../../rng';
import { applyAction } from '../../rules/apply-action';
import { legalActions } from '../../rules/legal-actions';
import { createGame } from '../../state/create-game';
import { MAX_BOARD } from '../../state/types';
import type { Action, GameState, TargetRef } from '../../state/types';
import {
  catalogOf,
  minionCard,
  putOnBoard,
  setEnergy,
} from '../../testing/builders';
import { getHero, heroes, heroSkill, withHeroTokens } from '..';
import { heroToken } from '../tokens';

// Skills 2 and 3 are shelved (inactive in the SKILLS table) while the
// launch-style game is built; these tests still cover their code. So every
// skill of the classes that have all three coded is switched on here, and
// skill 1 of the others.
jest.mock('../../../data/skills.json', () => {
  const allThree = ['FIGHTER', 'WIZARD', 'RANGER', 'CLERIC', 'WARDEN'];
  const raw = jest.requireActual('../../../data/skills.json') as {
    class?: string;
    id: number;
  }[];

  return raw.map((skill) => {
    const key = (skill.class ?? '').replace(/%/g, '').replace('CLASS_', '');
    const isOn = allThree.includes(key) || (!!skill.class && skill.id === 1);

    return { ...skill, active: isOn };
  });
});

const grunt = minionCard('GRUNT', { cost: 1, attack: 2, health: 3 });
const catalog = withHeroTokens(
  catalogOf(...Array.from(loadHsCards().byId.values()), grunt),
);

const game = (hero0: string, hero1 = 'WIZARD'): GameState => {
  const s = createGame(
    {
      decks: { '0': Array(30).fill('GRUNT'), '1': Array(30).fill('GRUNT') },
      firstPlayer: '0',
      heroes: { '0': hero0, '1': hero1 },
    },
    createSeededRng(1),
  );
  return setEnergy(s, '0', 10);
};
const act = (s: GameState, a: Action, seed = 1) => {
  const r = applyAction(s, a, { rng: createSeededRng(seed), catalog });
  if ('error' in r) throw new Error(r.error);
  return r;
};
const skill = (s: GameState, n: number, target?: TargetRef) =>
  act(s, { type: 'HeroSkill', skill: n, target });
const err = (s: GameState, a: Action) => {
  const r = applyAction(s, a, { rng: createSeededRng(1), catalog });
  return 'error' in r ? r.error : null;
};
const endTurns = (s: GameState, n: number): GameState => {
  for (let i = 0; i < n; i++)
    s = setEnergy(
      act(s, { type: 'EndTurn' }).state,
      s.activePlayer === '0' ? '1' : '0',
      10,
    );
  return s;
};
const foeHero = { kind: 'hero', player: '1' } as const;

describe('spell damage on skills', () => {
  const elder = minionCard('ELDER', { cost: 1, attack: 1, health: 1 });
  const defs = (c: { id: string }) =>
    c.id === 'ELDER' ? { spellDamage: 1 } : undefined;
  const cat = withHeroTokens(
    catalogOf(...Array.from(loadHsCards().byId.values()), grunt, elder),
  );
  const use = (s: GameState, n: number, target?: TargetRef) => {
    const r = applyAction(
      s,
      { type: 'HeroSkill', skill: n, target },
      { rng: createSeededRng(1), catalog: cat, defs: defs as never },
    );
    if ('error' in r) throw new Error(r.error);
    return r.state;
  };
  it("a Spell Damage +1 minion makes Zeus' 1 damage skill hit for 2, and it is gone with the minion", () => {
    expect(use(game('WIZARD'), 0, foeHero).players['1'].health).toBe(29);
    const withElder = putOnBoard(game('WIZARD'), '0', elder);
    expect(use(withElder, 0, foeHero).players['1'].health).toBe(28);
    expect(
      use(putOnBoard(game('WIZARD'), '1', elder), 0, foeHero).players['1']
        .health,
    ).toBe(29); // the enemy's does nothing for you
  });
  it("does not raise the Necromancer's damage to itself", () => {
    const withElder = putOnBoard(game('NECROMANCER'), '0', elder);
    expect(use(withElder, 0).players['0'].health).toBe(28);
  });
  it('raises an area skill on every minion and leaves a heal alone', () => {
    let s = putOnBoard(putOnBoard(game('WIZARD'), '0', elder), '1', grunt, {
      health: 9,
      maxHealth: 9,
    });
    expect(use(s, 1).players['1'].board[0].health).toBe(9 - 4);
    s = putOnBoard(game('CLERIC'), '0', elder);
    s = produce(s, (g) => void (g.players['0'].health = 10));
    expect(use(s, 0, { kind: 'hero', player: '0' }).players['0'].health).toBe(
      13,
    );
  });
});

describe('the playable heroes', () => {
  it('are the nine classes with skill code, each with all of its skills', () => {
    expect(heroes().map((h) => h.id)).toEqual([
      'FIGHTER',
      'WIZARD',
      'RANGER',
      'CLERIC',
      'CRUSADER',
      'ASSASSIN',
      'MYSTIC',
      'NECROMANCER',
      'WARDEN',
    ]);
    for (const h of heroes()) {
      const onlyFirst = ['CRUSADER', 'ASSASSIN', 'MYSTIC', 'NECROMANCER'];

      expect(h.skills).toHaveLength(onlyFirst.includes(h.id) ? 1 : 3);
    }
  });
  it('take their skill numbers from the ability data', () => {
    expect(getHero('WIZARD')!.skills.map((k) => [k.cost, k.cooldown])).toEqual([
      [2, 1],
      [6, 3],
      [10, undefined],
    ]);
  });
  it('createGame refuses an unknown hero', () => {
    expect(() => game('NOPE')).toThrow();
  });
  it('a game without heroes has no hero state and offers no skills', () => {
    const s = createGame(
      {
        decks: { '0': Array(30).fill('GRUNT'), '1': Array(30).fill('GRUNT') },
        firstPlayer: '0',
      },
      createSeededRng(1),
    );
    expect(s.players['0'].hero).toBeUndefined();
    expect(
      legalActions(s, '0', catalog).some((a) => a.type === 'HeroSkill'),
    ).toBe(false);
  });
});

describe('skill rules', () => {
  it('a skill costs its energy and starts its cooldown', () => {
    const r = skill(game('WIZARD'), 0, foeHero);
    expect(r.state.players['0'].energy.current).toBe(8);
    expect(r.state.players['0'].hero!.cooldowns[0]).toBe(1);
    expect(r.state.players['1'].health).toBe(29);
    expect(r.events).toContainEqual({
      type: 'HeroSkillUsed',
      player: '0',
      skill: 0,
      target: foeHero,
    });
  });
  it('cannot be used again until the owner has started another turn (cooldown 1)', () => {
    const s = skill(game('WIZARD'), 0, foeHero).state;
    expect(err(s, { type: 'HeroSkill', skill: 0, target: foeHero })).toBe(
      'SKILL_UNAVAILABLE',
    );
    const next = endTurns(s, 2);
    expect(
      err(next, { type: 'HeroSkill', skill: 0, target: foeHero }),
    ).toBeNull();
  });
  it("a cooldown of 3 skips two of the owner's turns", () => {
    const s = skill(game('WIZARD'), 1).state;
    expect(err(endTurns(s, 2), { type: 'HeroSkill', skill: 1 })).toBe(
      'SKILL_UNAVAILABLE',
    );
    expect(err(endTurns(s, 4), { type: 'HeroSkill', skill: 1 })).toBe(
      'SKILL_UNAVAILABLE',
    );
    expect(err(endTurns(s, 6), { type: 'HeroSkill', skill: 1 })).toBeNull();
  });
  it('an ultimate (no cooldown) works once per game', () => {
    const s = skill(game('WIZARD'), 2, foeHero).state;
    expect(s.players['1'].health).toBe(20);
    expect(
      err(endTurns(s, 4), { type: 'HeroSkill', skill: 2, target: foeHero }),
    ).toBe('SKILL_UNAVAILABLE');
  });
  it('refuses a skill the player cannot afford', () => {
    expect(
      err(setEnergy(game('WIZARD'), '0', 1), {
        type: 'HeroSkill',
        skill: 0,
        target: foeHero,
      }),
    ).toBe('CANT_AFFORD');
  });
  it('refuses a missing or unknown skill and a missing target', () => {
    expect(err(game('WIZARD'), { type: 'HeroSkill', skill: 3 })).toBe(
      'BAD_SKILL',
    );
    expect(err(game('WIZARD'), { type: 'HeroSkill', skill: 0 })).toBe(
      'ILLEGAL_TARGET',
    );
  });
  it('legalActions offers only ready, affordable skills, once per target', () => {
    const s = putOnBoard(game('WIZARD'), '1', grunt);
    const zeus = (st: GameState) =>
      legalActions(st, '0', catalog).filter((a) => a.type === 'HeroSkill');
    // Lightning Strike aims at any of 4 characters (two heroes, one minion...
    // plus none of mine), Rain Lightning is global.
    expect(
      zeus(s).filter((a) => a.type === 'HeroSkill' && a.skill === 0),
    ).toHaveLength(3);
    expect(
      zeus(s).filter((a) => a.type === 'HeroSkill' && a.skill === 1),
    ).toHaveLength(1);
    expect(zeus(setEnergy(s, '0', 1))).toHaveLength(0);
    expect(
      zeus(setEnergy(s, '0', 10)).some(
        (a) => a.type === 'HeroSkill' && a.skill === 2,
      ),
    ).toBe(true);
  });
  it("are not offered on the other player's turn", () => {
    expect(legalActions(game('WIZARD'), '1', catalog)).toEqual([]);
  });
});

describe('Zeus', () => {
  it('Rain Lightning hits every enemy minion for 3 and nothing else', () => {
    let s = putOnBoard(game('WIZARD'), '1', grunt, { health: 5, maxHealth: 5 });
    s = putOnBoard(s, '0', grunt, { health: 5, maxHealth: 5 });
    const r = skill(s, 1).state;
    expect(r.players['1'].board[0].health).toBe(2);
    expect(r.players['0'].board[0].health).toBe(5);
    expect(r.players['1'].health).toBe(30);
  });
  it('Lightning Blast kills a minion it is aimed at', () => {
    const s = putOnBoard(game('WIZARD'), '1', grunt, {
      health: 9,
      maxHealth: 9,
    });
    const r = skill(s, 2, {
      kind: 'minion',
      instanceId: s.players['1'].board[0].instanceId,
    }).state;
    expect(r.players['1'].board).toHaveLength(0);
  });
});

describe('skill text', () => {
  it('fills in %NUM1% / %NUM2% from the ability numbers and leaves no raw symbol', () => {
    expect(getHero('FIGHTER')!.skills[2].text).toBe(
      'Set your Health to 15 and gain 10 Armor',
    );
    expect(getHero('RANGER')!.skills[2].text).toMatch(/8\/8/);
    for (const h of heroes())
      for (const sk of h.skills) expect(sk.text).not.toMatch(/%/);
  });
});

describe('Warrior', () => {
  it('Armor gains 2 armor', () => {
    expect(skill(game('FIGHTER'), 0).state.players['0'].armor).toBe(2);
  });
  it('Violent Strike deals 4, or 6 while the Warrior has 12 or less Health', () => {
    expect(skill(game('FIGHTER'), 1, foeHero).state.players['1'].health).toBe(
      26,
    );
    const low = produce(
      game('FIGHTER'),
      (g) => void (g.players['0'].health = 12),
    );
    expect(skill(low, 1, foeHero).state.players['1'].health).toBe(24);
    const edge = produce(
      game('FIGHTER'),
      (g) => void (g.players['0'].health = 13),
    );
    expect(skill(edge, 1, foeHero).state.players['1'].health).toBe(26);
  });
  it('Last Stand sets Health to 15 and gains 10 armor, with no target', () => {
    const low = produce(
      game('FIGHTER'),
      (g) => void ((g.players['0'].health = 5), (g.players['0'].armor = 3)),
    );
    const r = skill(low, 2).state.players['0'];
    expect([r.health, r.armor]).toEqual([15, 13]);
    const high = skill(game('FIGHTER'), 2).state.players['0'];
    expect([high.health, high.armor]).toEqual([15, 10]);
  });
});

describe('Necromancer', () => {
  const pact = (s: GameState) => skill(s, 0).state.players['0'];
  const me = (s: GameState) => s.players['0'];

  it('is offered with its skill, which costs 2 energy and has a cooldown of 1', () => {
    expect(heroSkill('NECROMANCER', 0)).toMatchObject({ cost: 2, cooldown: 1 });
  });
  it('takes 2 damage and draws a card, with no target', () => {
    const before = me(game('NECROMANCER'));
    const after = pact(game('NECROMANCER'));
    expect(after.health).toBe(before.health - 2);
    expect(after.hand).toHaveLength(before.hand.length + 1);
    expect(after.deck).toHaveLength(before.deck.length - 1);
  });
  it('spends the energy and then waits out its cooldown', () => {
    const s = skill(game('NECROMANCER'), 0).state;
    expect(me(s).energy.current).toBe(8);
    expect(err(s, { type: 'HeroSkill', skill: 0 })).not.toBeNull();
  });
  it('is absorbed by armor first, like any damage to the hero', () => {
    const armored = produce(
      game('NECROMANCER'),
      (g) => void (g.players['0'].armor = 5),
    );
    const after = pact(armored);
    expect([after.health, after.armor]).toEqual([30, 3]);
  });
  it('can bring the hero to 0 Health, which ends the game', () => {
    const low = produce(
      game('NECROMANCER'),
      (g) => void (g.players['0'].health = 2),
    );
    expect(pact(low).health).toBe(0);
  });
});
describe('Crusader', () => {
  it('Recruit costs 2 energy with a cooldown of 1', () => {
    expect(heroSkill('CRUSADER', 0)).toMatchObject({ cost: 2, cooldown: 1 });
  });
  it('summons a 1/1 Recruit onto the board, with no target', () => {
    const board = skill(game('CRUSADER'), 0).state.players['0'].board;

    expect(board).toHaveLength(1);
    expect(board[0].cardId).toBe('GAME_002');
    expect([board[0].attack, board[0].health]).toEqual([1, 1]);
  });
  it('does nothing but still costs energy when the board is full', () => {
    let s = game('CRUSADER');

    for (let i = 0; i < MAX_BOARD; i++) s = putOnBoard(s, '0', grunt);
    const after = skill(s, 0).state.players['0'];

    expect(after.board).toHaveLength(MAX_BOARD);
    expect(after.energy.current).toBe(8);
  });
});

describe('Mystic', () => {
  const totems = ['GAME_004', 'GAME_005', 'GAME_006', 'GAME_007'];
  const boardOf = (s: GameState) =>
    s.players['0'].board.map((minion) => minion.cardId);
  const callTotems = (times: number, seed = 1): GameState => {
    let s = game('MYSTIC');

    for (let i = 0; i < times; i++) {
      s = act(s, { type: 'HeroSkill', skill: 0 }, seed + i).state;
      s = endTurns(s, 2);
    }

    return s;
  };

  it('Call Totem costs 2 energy with a cooldown of 1', () => {
    expect(heroSkill('MYSTIC', 0)).toMatchObject({ cost: 2, cooldown: 1 });
  });
  it('summons one of the four totems', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const s = act(game('MYSTIC'), { type: 'HeroSkill', skill: 0 }, seed);

      expect(totems).toContain(boardOf(s.state)[0]);
    }
  });
  it('never repeats a totem you already have, so four calls give all four', () => {
    for (let seed = 1; seed <= 10; seed++) {
      expect([...boardOf(callTotems(4, seed))].sort()).toEqual(
        [...totems].sort(),
      );
    }
  });
  it('does nothing once all four totems are on the board', () => {
    const s = callTotems(5);

    expect(boardOf(s)).toHaveLength(4);
  });
  it('Stone Totem has Guard, Ember Totem is a plain 1/1', () => {
    const stone = putOnBoard(game('MYSTIC'), '0', catalog.get('GAME_005')!);
    const ember = catalog.get('GAME_004')!;

    expect(stone.players['0'].board[0].keywords.guard).toBe(true);
    expect([ember.attack, ember.health]).toEqual([1, 1]);
  });
  it('Spring Totem heals your minions 1 at the end of your turn', () => {
    let s = putOnBoard(game('MYSTIC'), '0', catalog.get('GAME_006')!);

    s = putOnBoard(s, '0', grunt, { health: 1, maxHealth: 3 });
    s = act(s, { type: 'EndTurn' }).state;
    expect(s.players['0'].board[1].health).toBe(2);
  });
  it('Gale Totem adds +1 Spell Damage to your skills', () => {
    const s = putOnBoard(game('WIZARD'), '0', catalog.get('GAME_007')!);

    expect(skill(s, 0, foeHero).state.players['1'].health).toBe(28);
  });
});

describe('Assassin', () => {
  it('Equip Dagger costs 2 energy with a cooldown of 1', () => {
    expect(heroSkill('ASSASSIN', 0)).toMatchObject({ cost: 2, cooldown: 1 });
  });
  it('equips a 1/2 dagger, with no target', () => {
    const after = skill(game('ASSASSIN'), 0).state.players['0'];

    expect(after.weapon).toMatchObject({
      cardId: 'GAME_003',
      attack: 1,
      durability: 2,
    });
    expect(after.energy.current).toBe(8);
  });
  it('replaces a weapon you already hold', () => {
    const armed = produce(game('ASSASSIN'), (g) => {
      g.players['0'].weapon = {
        instanceId: 99,
        cardId: 'OLD',
        attack: 5,
        durability: 1,
      };
    });

    expect(skill(armed, 0).state.players['0'].weapon?.cardId).toBe('GAME_003');
  });
  it('lets the hero attack with it straight away, wearing it down', () => {
    const armed = skill(game('ASSASSIN'), 0).state;
    const hit = act(armed, { type: 'WeaponAttack', target: foeHero }).state;

    expect(hit.players['1'].health).toBe(29);
    expect(hit.players['0'].weapon?.durability).toBe(1);
  });
});

describe('Cleric (SAGE)', () => {
  it('Revitalize heals 3', () => {
    const s = produce(game('CLERIC'), (g) => void (g.players['0'].health = 20));
    expect(
      skill(s, 0, { kind: 'hero', player: '0' }).state.players['0'].health,
    ).toBe(23);
  });
  describe('Resurrect: pick a recently dead minion, back with Guard or Bubble', () => {
    const named = (id: string, attack: number, health: number) =>
      minionCard(id, { cost: 1, attack, health });
    const minis = Array.from({ length: 8 }, (_, i) =>
      named(`M${i + 1}`, 1, 1 + i),
    );
    const big = named('BIG', 6, 6);
    const cat = withHeroTokens(
      catalogOf(
        ...Array.from(loadHsCards().byId.values()),
        grunt,
        big,
        ...minis,
      ),
    );
    const withDead = (mine: string[], theirs: string[] = [], turn = 1) =>
      produce(game('CLERIC'), (g) => {
        g.players['0'].graveyard = mine;
        g.players['1'].graveyard = theirs;
        g.turn = turn;
      });
    const offered = (s: GameState) =>
      legalActions(s, '0', cat).flatMap((a) =>
        a.type === 'HeroSkill' && a.skill === 1 && a.choice !== undefined
          ? [a.choice]
          : [],
      );
    const useChoice = (s: GameState, choice: number) => {
      const r = applyAction(
        s,
        { type: 'HeroSkill', skill: 1, choice },
        { rng: createSeededRng(1), catalog: cat },
      );
      if ('error' in r) throw new Error(r.error);
      return r.state;
    };

    it('cannot be used with nothing dead, even if the enemy has dead minions', () => {
      expect(offered(withDead([]))).toEqual([]);
      expect(offered(withDead([], ['BIG']))).toEqual([]);
      expect(
        applyAction(
          withDead([]),
          { type: 'HeroSkill', skill: 1 },
          { rng: createSeededRng(1), catalog: cat },
        ),
      ).toEqual({ error: 'BAD_CHOICE' });
    });
    it('offers one minion as two options (Guard, Bubble) and brings it back with the one picked', () => {
      const s = withDead(['GRUNT']);
      expect(offered(s)).toEqual([0, 1]);
      const guard = useChoice(s, 0).players['0'];
      expect(
        guard.board.map((m) => [
          m.cardId,
          m.keywords.guard,
          !!m.keywords.bubble,
        ]),
      ).toEqual([['GRUNT', true, false]]);
      expect(guard.graveyard).toEqual([]);
      const bubble = useChoice(s, 1).players['0'];
      expect(
        bubble.board.map((m) => [
          m.cardId,
          !!m.keywords.guard,
          m.keywords.bubble,
        ]),
      ).toEqual([['GRUNT', false, true]]);
    });
    it('offers two different minions from only the last five deaths', () => {
      const dead = minis.map((m) => m.id); // M1 .. M8; the last five are M4 .. M8
      for (let turn = 1; turn <= 60; turn++) {
        const s = withDead(dead, [], turn);
        const ids = offered(s).map((c) => skillOptionCard(s, c));
        expect(new Set(ids).size).toBe(2);
        ids.forEach((id) =>
          expect(['M4', 'M5', 'M6', 'M7', 'M8']).toContain(id),
        );
      }
    });
    it('gives the same offer when asked twice and varies from turn to turn', () => {
      const seen = new Set<string>();
      for (let turn = 1; turn <= 60; turn++) {
        const s = withDead(
          minis.map((m) => m.id),
          [],
          turn,
        );
        const a = offered(s)
          .map((c) => skillOptionCard(s, c))
          .join();
        expect(
          offered(s)
            .map((c) => skillOptionCard(s, c))
            .join(),
        ).toBe(a);
        seen.add(a);
      }
      expect(seen.size).toBeGreaterThan(3);
    });
    it("now and then offers the strongest of the enemy's recent dead instead, and takes it from their graveyard", () => {
      let withEnemy = 0;
      let stolen: GameState | undefined;
      for (let turn = 1; turn <= 400; turn++) {
        const s = withDead(['M1', 'M2', 'M3'], ['M5', 'BIG', 'M6'], turn);
        const ids = offered(s).map((c) => skillOptionCard(s, c));
        if (ids.includes('BIG')) {
          withEnemy++;
          stolen ??= s;
        }
        ids.forEach((id) => expect(['M1', 'M2', 'M3', 'BIG']).toContain(id)); // never a weaker enemy minion
      }
      expect(withEnemy).toBeGreaterThan(400 * 0.05);
      expect(withEnemy).toBeLessThan(400 * 0.3);
      const pickBig = offered(stolen!).find(
        (c) => skillOptionCard(stolen!, c) === 'BIG',
      )!;
      const after = useChoice(stolen!, pickBig);
      expect(after.players['0'].board.map((m) => m.cardId)).toEqual(['BIG']);
      expect(after.players['1'].graveyard).toEqual(['M5', 'M6']);
      expect(after.players['0'].graveyard).toHaveLength(3);
    });
    it('refuses a choice that was not offered, and a choice on a skill with no options', () => {
      const s = withDead(['GRUNT']);
      expect(err(s, { type: 'HeroSkill', skill: 1, choice: 2 })).toBe(
        'BAD_CHOICE',
      );
      expect(err(s, { type: 'HeroSkill', skill: 1 })).toBe('BAD_CHOICE');
      expect(
        err(game('CLERIC'), {
          type: 'HeroSkill',
          skill: 0,
          choice: 0,
          target: { kind: 'hero', player: '0' },
        }),
      ).toBe('BAD_CHOICE');
    });
    it('does nothing (and keeps the graveyard) when the board is full', () => {
      let s = withDead(['GRUNT']);
      for (let i = 0; i < 7; i++) s = putOnBoard(s, '0', grunt);
      const after = useChoice(s, 0).players['0'];
      expect(after.board).toHaveLength(7);
      expect(after.graveyard).toEqual(['GRUNT']);
    });

    /**
     * The card a legal Resurrect choice would bring back (read off its label).
     */
    const skillOptionCard = (s: GameState, choice: number): string => {
      const opts = heroSkill('CLERIC', 1)!.options!(s, '0', cat);
      return opts[choice].cardId!;
    };
  });
  it('Mass Resurrect returns up to 3 of them', () => {
    const s = produce(
      game('CLERIC'),
      (g) =>
        void (g.players['0'].graveyard = ['GRUNT', 'GRUNT', 'GRUNT', 'GRUNT']),
    );
    const r = skill(s, 2).state;
    expect(r.players['0'].board).toHaveLength(3);
    expect(r.players['0'].graveyard).toHaveLength(1);
  });
  it("a minion that dies in combat goes to its owner's graveyard; tokens do not", () => {
    let s = putOnBoard(game('WIZARD'), '1', grunt, { health: 2, maxHealth: 2 });
    s = skill(s, 1).state;
    expect(s.players['1'].graveyard).toEqual(['GRUNT']);
    // Eagle (4/2) summoned, then Rain Lightning from the other side kills it: a
    // token is not remembered.
    let t = skill(game('RANGER', 'WIZARD'), 1).state;
    t = setEnergy(act(t, { type: 'EndTurn' }).state, '1', 10);
    t = skill(t, 1).state;
    expect(t.players['0'].board).toHaveLength(0);
    expect(t.players['0'].graveyard ?? []).toEqual([]);
  });
});

describe('Exile', () => {
  it('Vital Shot hits the enemy hero for 2 even behind a Guard', () => {
    let s = putOnBoard(game('RANGER'), '1', grunt);
    s = produce(s, (g) => void (g.players['1'].board[0].keywords.guard = true));
    expect(skill(s, 0).state.players['1'].health).toBe(28);
  });
  it('summons a 4/2 Eagle that can attack at once, then the 8/8 Beast', () => {
    const e = skill(game('RANGER'), 1).state.players['0'].board[0];
    expect([e.cardId, e.attack, e.health, e.keywords.rush]).toEqual([
      'HERO_EXILE_EAGLE',
      4,
      2,
      true,
    ]);
    const b = skill(game('RANGER'), 2).state.players['0'].board[0];
    expect([b.attack, b.health]).toEqual([8, 8]);
  });
  it('does nothing on a full board', () => {
    let s = game('RANGER');
    for (let i = 0; i < 7; i++) s = putOnBoard(s, '0', grunt);
    expect(skill(s, 1).state.players['0'].board).toHaveLength(7);
  });
});

describe('Wildcaller', () => {
  it('Shapeshift gives +1 Attack this turn and 1 Armor, summoning nothing', () => {
    const { state } = skill(game('WARDEN'), 0);
    const { weapon, armor, board } = state.players['0'];
    expect([weapon?.attack, weapon?.temporary, armor]).toEqual([1, true, 1]);
    expect(board).toHaveLength(0);
  });
  it('Shapeshift adds its Attack to a weapon already equipped', () => {
    const { state } = skill(
      produce(game('WARDEN'), (g) => {
        g.players['0'].weapon = {
          instanceId: 9999,
          cardId: 'GRUNT',
          attack: 2,
          durability: 2,
        };
      }),
      0,
    );
    expect(state.players['0'].weapon?.attack).toBe(3);
  });
  it('Savagery gives every friendly Creature +2/+2 and leaves other minions alone', () => {
    let s = putOnBoard(game('WARDEN'), '0', heroToken('HERO_DRUID_WOLF'));
    s = putOnBoard(s, '0', grunt);
    const before = s.players['0'].board.map((m) => [m.attack, m.health]);
    const r = skill(setEnergy(s, '0', 10), 1).state.players['0'].board.map(
      (m) => [m.attack, m.health],
    );
    expect(r[0]).toEqual([before[0][0] + 2, before[0][1] + 2]);
    expect(r[1]).toEqual(before[1]);
  });
  it('the ultimate summons a wolf, a bear and a hawk, each with +2/+2, and leaves Creatures already on the board alone', () => {
    let s = putOnBoard(game('WARDEN'), '0', heroToken('HERO_DRUID_WOLF'));
    const first = s.players['0'].board[0];
    s = setEnergy(s, '0', 10);
    const board = skill(s, 2).state.players['0'].board;
    expect(board).toHaveLength(4);
    const by = (id: string) =>
      board.find((m) => m.cardId === id && m.instanceId !== first.instanceId)!;
    expect([
      by('HERO_DRUID_WOLF')?.attack,
      by('HERO_DRUID_WOLF')?.health,
    ]).toEqual([5, 4]);
    expect([
      by('HERO_DRUID_BEAR')?.attack,
      by('HERO_DRUID_BEAR')?.health,
    ]).toEqual([4, 7]);
    expect([
      by('HERO_DRUID_HAWK')?.attack,
      by('HERO_DRUID_HAWK')?.health,
    ]).toEqual([4, 3]);
    expect(board.find((m) => m.instanceId === first.instanceId)!.attack).toBe(
      first.attack,
    );
  });
});

describe('bots', () => {
  it('a random game with heroes plays to the end without an engine error', () => {
    const { chooseRandomAction } = require('../../bots/random-bot');
    let s = game('CLERIC', 'WARDEN');
    const rng = createSeededRng(7);
    for (let i = 0; i < 600 && s.status === 'playing'; i++) {
      const a = chooseRandomAction(s, catalog, rng);
      const r = applyAction(s, a, { rng, catalog });
      expect('error' in r).toBe(false);
      if ('error' in r) return;
      s = r.state;
    }
  });
});

describe('once per game', () => {
  it('Mass Resurrect (Cleric) can be cast only once, however many turns pass', () => {
    let s = produce(
      game('CLERIC'),
      (g) =>
        void (g.players['0'].graveyard = ['GRUNT', 'GRUNT', 'GRUNT', 'GRUNT']),
    );
    s = skill(s, 2).state;
    expect(s.players['0'].hero!.spent[2]).toBe(true);
    for (let i = 0; i < 5; i++) {
      s = endTurns(s, 2);
      expect(err(s, { type: 'HeroSkill', skill: 2 })).toBe('SKILL_UNAVAILABLE');
      expect(
        legalActions(s, '0', catalog).some(
          (a) => a.type === 'HeroSkill' && a.skill === 2,
        ),
      ).toBe(false);
    }
  });
  it("every hero's ultimate is once per game, even if the data also gives it a cooldown", () => {
    for (const h of heroes()) {
      const ultimate = h.skills[2];

      if (ultimate) expect(ultimate.cooldown).toBeUndefined();
    }
  });
});
