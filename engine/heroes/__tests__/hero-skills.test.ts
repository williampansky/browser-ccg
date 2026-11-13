import { produce } from 'immer';
import { loadHsCards } from '../../cards/load-hs-cards';
import { createSeededRng } from '../../rng';
import { applyAction } from '../../rules/apply-action';
import { legalActions } from '../../rules/legal-actions';
import { createGame } from '../../state/create-game';
import type { Action, GameState, TargetRef } from '../../state/types';
import { catalogOf, minionCard, putOnBoard, setEnergy } from '../../testing/builders';
import { getHero, heroes, withHeroTokens } from '..';

const grunt = minionCard('GRUNT', { cost: 1, attack: 2, health: 3 });
const catalog = withHeroTokens(catalogOf(...Array.from(loadHsCards().byId.values()), grunt));

const game = (hero0: string, hero1 = 'ZEUS'): GameState => {
  const s = createGame(
    { decks: { '0': Array(30).fill('GRUNT'), '1': Array(30).fill('GRUNT') }, firstPlayer: '0', heroes: { '0': hero0, '1': hero1 } },
    createSeededRng(1)
  );
  return setEnergy(s, '0', 10);
};
const act = (s: GameState, a: Action, seed = 1) => {
  const r = applyAction(s, a, { rng: createSeededRng(seed), catalog });
  if ('error' in r) throw new Error(r.error);
  return r;
};
const skill = (s: GameState, n: number, target?: TargetRef) => act(s, { type: 'HeroSkill', skill: n, target });
const err = (s: GameState, a: Action) => {
  const r = applyAction(s, a, { rng: createSeededRng(1), catalog });
  return 'error' in r ? r.error : null;
};
const endTurns = (s: GameState, n: number): GameState => {
  for (let i = 0; i < n; i++) s = setEnergy(act(s, { type: 'EndTurn' }).state, s.activePlayer === '0' ? '1' : '0', 10);
  return s;
};
const foeHero = { kind: 'hero', player: '1' } as const;

describe('the playable heroes', () => {
  it('are the five marked active, each with three skills', () => {
    expect(heroes().map((h) => h.id).sort()).toEqual(['EXILE', 'FORSAKEN_DRUID', 'SAGE', 'WARRIOR', 'ZEUS']);
    for (const h of heroes()) expect(h.skills).toHaveLength(3);
  });
  it('take their skill numbers from the ability data', () => {
    expect(getHero('ZEUS')!.skills.map((k) => [k.cost, k.cooldown])).toEqual([[2, 1], [6, 2], [10, undefined]]);
  });
  it('createGame refuses an unknown hero', () => {
    expect(() => game('NOPE')).toThrow();
  });
  it('a game without heroes has no hero state and offers no skills', () => {
    const s = createGame({ decks: { '0': Array(30).fill('GRUNT'), '1': Array(30).fill('GRUNT') }, firstPlayer: '0' }, createSeededRng(1));
    expect(s.players['0'].hero).toBeUndefined();
    expect(legalActions(s, '0', catalog).some((a) => a.type === 'HeroSkill')).toBe(false);
  });
});

describe('skill rules', () => {
  it('a skill costs its energy and starts its cooldown', () => {
    const r = skill(game('ZEUS'), 0, foeHero);
    expect(r.state.players['0'].energy.current).toBe(8);
    expect(r.state.players['0'].hero!.cooldowns[0]).toBe(1);
    expect(r.state.players['1'].health).toBe(29);
    expect(r.events).toContainEqual({ type: 'HeroSkillUsed', player: '0', skill: 0, target: foeHero });
  });
  it('cannot be used again until the owner has started another turn (cooldown 1)', () => {
    const s = skill(game('ZEUS'), 0, foeHero).state;
    expect(err(s, { type: 'HeroSkill', skill: 0, target: foeHero })).toBe('SKILL_UNAVAILABLE');
    const next = endTurns(s, 2);
    expect(err(next, { type: 'HeroSkill', skill: 0, target: foeHero })).toBeNull();
  });
  it('a cooldown of 2 skips one of the owner\'s turns', () => {
    const s = skill(game('ZEUS'), 1).state;
    expect(err(endTurns(s, 2), { type: 'HeroSkill', skill: 1 })).toBe('SKILL_UNAVAILABLE');
    expect(err(endTurns(s, 4), { type: 'HeroSkill', skill: 1 })).toBeNull();
  });
  it('an ultimate (no cooldown) works once per game', () => {
    const s = skill(game('ZEUS'), 2, foeHero).state;
    expect(s.players['1'].health).toBe(20);
    expect(err(endTurns(s, 4), { type: 'HeroSkill', skill: 2, target: foeHero })).toBe('SKILL_UNAVAILABLE');
  });
  it('refuses a skill the player cannot afford', () => {
    expect(err(setEnergy(game('ZEUS'), '0', 1), { type: 'HeroSkill', skill: 0, target: foeHero })).toBe('CANT_AFFORD');
  });
  it('refuses a missing or unknown skill and a missing target', () => {
    expect(err(game('ZEUS'), { type: 'HeroSkill', skill: 3 })).toBe('BAD_SKILL');
    expect(err(game('ZEUS'), { type: 'HeroSkill', skill: 0 })).toBe('ILLEGAL_TARGET');
  });
  it('legalActions offers only ready, affordable skills, once per target', () => {
    const s = putOnBoard(game('ZEUS'), '1', grunt);
    const zeus = (st: GameState) => legalActions(st, '0', catalog).filter((a) => a.type === 'HeroSkill');
    // Lightning Strike aims at any of 4 characters (two heroes, one minion... plus none of mine), Rain Lightning is global.
    expect(zeus(s).filter((a) => a.type === 'HeroSkill' && a.skill === 0)).toHaveLength(3);
    expect(zeus(s).filter((a) => a.type === 'HeroSkill' && a.skill === 1)).toHaveLength(1);
    expect(zeus(setEnergy(s, '0', 1))).toHaveLength(0);
    expect(zeus(setEnergy(s, '0', 10)).some((a) => a.type === 'HeroSkill' && a.skill === 2)).toBe(true);
  });
  it('are not offered on the other player\'s turn', () => {
    expect(legalActions(game('ZEUS'), '1', catalog)).toEqual([]);
  });
});

describe('Zeus', () => {
  it('Rain Lightning hits every enemy minion for 3 and nothing else', () => {
    let s = putOnBoard(game('ZEUS'), '1', grunt, { health: 5, maxHealth: 5 });
    s = putOnBoard(s, '0', grunt, { health: 5, maxHealth: 5 });
    const r = skill(s, 1).state;
    expect(r.players['1'].board[0].health).toBe(2);
    expect(r.players['0'].board[0].health).toBe(5);
    expect(r.players['1'].health).toBe(30);
  });
  it('Lightning Blast kills a minion it is aimed at', () => {
    const s = putOnBoard(game('ZEUS'), '1', grunt, { health: 9, maxHealth: 9 });
    const r = skill(s, 2, { kind: 'minion', instanceId: s.players['1'].board[0].instanceId }).state;
    expect(r.players['1'].board).toHaveLength(0);
  });
});

describe('Warrior', () => {
  it('Armor gains 2 armor', () => {
    expect(skill(game('WARRIOR'), 0).state.players['0'].armor).toBe(2);
  });
  it('Violent Strike deals 4, or 6 while the Warrior has 12 or less Health', () => {
    expect(skill(game('WARRIOR'), 1, foeHero).state.players['1'].health).toBe(26);
    const low = produce(game('WARRIOR'), (g) => void (g.players['0'].health = 12));
    expect(skill(low, 1, foeHero).state.players['1'].health).toBe(24);
    const edge = produce(game('WARRIOR'), (g) => void (g.players['0'].health = 13));
    expect(skill(edge, 1, foeHero).state.players['1'].health).toBe(26);
  });
  it('Smash! deals damage equal to the Warrior\'s armor, to minions only', () => {
    let s = putOnBoard(game('WARRIOR'), '1', grunt, { health: 6, maxHealth: 6 });
    s = produce(s, (g) => void (g.players['0'].armor = 4));
    const targets = legalActions(s, '0', catalog).flatMap((a) => (a.type === 'HeroSkill' && a.skill === 2 ? [a.target] : []));
    expect(targets).toEqual([{ kind: 'minion', instanceId: s.players['1'].board[0].instanceId }]);
    const r = skill(s, 2, targets[0]).state;
    expect(r.players['1'].board[0].health).toBe(2);
    expect(r.players['0'].armor).toBe(4);
  });
});

describe('Cleric (SAGE)', () => {
  it('Revitalize heals 2', () => {
    const s = produce(game('SAGE'), (g) => void (g.players['0'].health = 20));
    expect(skill(s, 0, { kind: 'hero', player: '0' }).state.players['0'].health).toBe(22);
  });
  it('Resurrect brings back a dead friendly minion once, and nothing from an empty graveyard', () => {
    expect(skill(game('SAGE'), 1).state.players['0'].board).toHaveLength(0);
    const dead = produce(game('SAGE'), (g) => void (g.players['0'].graveyard = ['GRUNT']));
    const r = skill(dead, 1).state;
    expect(r.players['0'].board.map((m) => m.cardId)).toEqual(['GRUNT']);
    expect(r.players['0'].graveyard).toEqual([]);
  });
  it('Mass Resurrect returns up to 3 of them', () => {
    const s = produce(game('SAGE'), (g) => void (g.players['0'].graveyard = ['GRUNT', 'GRUNT', 'GRUNT', 'GRUNT']));
    const r = skill(s, 2).state;
    expect(r.players['0'].board).toHaveLength(3);
    expect(r.players['0'].graveyard).toHaveLength(1);
  });
  it('a minion that dies in combat goes to its owner\'s graveyard; tokens do not', () => {
    let s = putOnBoard(game('ZEUS'), '1', grunt, { health: 2, maxHealth: 2 });
    s = skill(s, 1).state;
    expect(s.players['1'].graveyard).toEqual(['GRUNT']);
    // Eagle (4/2) summoned, then Rain Lightning from the other side kills it: a token is not remembered.
    let t = skill(game('EXILE', 'ZEUS'), 1).state;
    t = setEnergy(act(t, { type: 'EndTurn' }).state, '1', 10);
    t = skill(t, 1).state;
    expect(t.players['0'].board).toHaveLength(0);
    expect(t.players['0'].graveyard ?? []).toEqual([]);
  });
});

describe('Exile', () => {
  it('Vital Shot hits the enemy hero for 2 even behind a Guard', () => {
    let s = putOnBoard(game('EXILE'), '1', grunt);
    s = produce(s, (g) => void (g.players['1'].board[0].keywords.guard = true));
    expect(skill(s, 0).state.players['1'].health).toBe(28);
  });
  it('summons a 4/2 Eagle that can attack at once, then the 8/8 Beast', () => {
    const e = skill(game('EXILE'), 1).state.players['0'].board[0];
    expect([e.cardId, e.attack, e.health, e.keywords.rush]).toEqual(['HERO_EXILE_EAGLE', 4, 2, true]);
    const b = skill(game('EXILE'), 2).state.players['0'].board[0];
    expect([b.attack, b.health]).toEqual([8, 8]);
  });
  it('does nothing on a full board', () => {
    let s = game('EXILE');
    for (let i = 0; i < 7; i++) s = putOnBoard(s, '0', grunt);
    expect(skill(s, 1).state.players['0'].board).toHaveLength(7);
  });
});

describe('Forsaken Druid', () => {
  it('Spirit Animal summons one of its beasts', () => {
    const m = skill(game('FORSAKEN_DRUID'), 0).state.players['0'].board;
    expect(m).toHaveLength(1);
    expect(m[0].cardId.startsWith('HERO_DRUID_')).toBe(true);
  });
  it('Savagery gives every friendly Creature +2/+2 and leaves other minions alone', () => {
    let s = skill(game('FORSAKEN_DRUID'), 0).state;
    s = putOnBoard(s, '0', grunt);
    const before = s.players['0'].board.map((m) => [m.attack, m.health]);
    const r = skill(setEnergy(s, '0', 10), 1).state.players['0'].board.map((m) => [m.attack, m.health]);
    expect(r[0]).toEqual([before[0][0] + 2, before[0][1] + 2]);
    expect(r[1]).toEqual(before[1]);
  });
  it('True Form raises Health to 15 at least and equips claws', () => {
    const low = produce(game('FORSAKEN_DRUID'), (g) => void (g.players['0'].health = 6));
    const r = skill(low, 2).state.players['0'];
    expect([r.health, r.weapon?.cardId, r.weapon?.attack]).toEqual([15, 'HERO_DRUID_CLAWS', 5]);
    const high = skill(game('FORSAKEN_DRUID'), 2).state.players['0'];
    expect(high.health).toBe(30);
  });
});

describe('bots', () => {
  it('a random game with heroes plays to the end without an engine error', () => {
    const { chooseRandomAction } = require('../../bots/random-bot');
    let s = game('SAGE', 'FORSAKEN_DRUID');
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
    let s = produce(game('SAGE'), (g) => void (g.players['0'].graveyard = ['GRUNT', 'GRUNT', 'GRUNT', 'GRUNT']));
    s = skill(s, 2).state;
    expect(s.players['0'].hero!.spent[2]).toBe(true);
    for (let i = 0; i < 5; i++) {
      s = endTurns(s, 2);
      expect(err(s, { type: 'HeroSkill', skill: 2 })).toBe('SKILL_UNAVAILABLE');
      expect(legalActions(s, '0', catalog).some((a) => a.type === 'HeroSkill' && a.skill === 2)).toBe(false);
    }
  });
  it('every hero\'s ultimate is once per game, even if the data also gives it a cooldown', () => {
    for (const h of heroes()) expect(h.skills[2].cooldown).toBeUndefined();
  });
});
