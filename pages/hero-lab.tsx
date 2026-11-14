import { useRouter } from 'next/router';
import { useState } from 'react';
import { getHero } from '../engine/heroes';
import { HeroBust } from '../components/play-board/HeroBust';
import {
  FigureSkill,
  HeroCard,
  HeroFigure,
  HeroMedallion
} from '../components/play-board/HeroVariants';

const TABS = [
  {
    id: 'bust',
    label: '1 Bust',
    note: 'An arched portrait above a base plate; health and armor are gems.'
  },
  {
    id: 'figure',
    label: '2 Standing figure',
    note: 'A tall card in the TCG Vol 14 frame laid out like its sample: ribbon name, gems for health and armor, skills in the panel.'
  },
  {
    id: 'medal',
    label: '3 Medallion',
    note: 'A big round portrait: health is the outer arc, armor a thinner arc inside it.'
  },
  {
    id: 'card',
    label: '4 Card panel',
    note: 'The hero drawn like the hand cards, in the same frame art.'
  }
] as const;

const SKILL_STATES = [
  ['ready', 'Ready'],
  ['selected', 'Selected (aiming)'],
  ['cd1', 'Cooldown 1'],
  ['cd3', 'Cooldown 3'],
  ['spent', 'Used (ultimate)'],
  ['off', 'Disabled (no energy)']
] as const;

/** The hero's real skill n (name, cost, text from the data) in a chosen state; heroes without skill code get placeholders. */
const skillFrom = (state: string, n: number, heroId: string): FigureSkill => {
  const real = getHero(heroId)?.skills[n - 1];
  return {
    name: real?.name ?? `Skill ${n}`,
    cost: real?.cost ?? n + 1,
    text: real?.text ?? 'No skill data for this hero yet.',
    usable: state === 'ready' || state === 'selected',
    cooldownLeft: state === 'cd1' ? 1 : state === 'cd3' ? 3 : 0,
    spent: state === 'spent',
    selected: state === 'selected',
    targeted: !!real?.target
  };
};

/** Prototype weapon art for the standing figure, keyed by card id (attack / durability from data/core.json). */
const WEAPONS: Record<string, { image: string; attack: number; durability: number }> = {
  CORE_076: { image: '/images/weapons/CORE_076-WEAPON.png', attack: 2, durability: 2 },
  CORE_100: { image: '/images/weapons/CORE_100-WEAPON.png', attack: 3, durability: 4 },
  CORE_081: { image: '/images/weapons/CORE_081-WEAPON.png', attack: 3, durability: 2 }
};

const HEROES = [
  ['ZEUS', 'Zeus'],
  ['ASAR', 'Asar'],
  ['ATLAS', 'Atlas'],
  ['EXILE', 'Exile'],
  ['SAGE', 'Sage'],
  ['WARRIOR', 'Warrior'],
  ['FORSAKEN_DRUID', 'Forsaken Druid']
];

/** PROTOTYPE page: the "bust" hero display with the real hero art (dev only, not linked). */
const HeroLab = () => {
  const [health, setHealth] = useState(30);
  const [armor, setArmor] = useState(0);
  const [active, setActive] = useState(true);
  const [weapon, setWeapon] = useState('CORE_076');
  const [skillStates, setSkillStates] = useState(['ready', 'cd3', 'spent']);
  const router = useRouter();

  // The tab lives in ?tab= so a refresh (or a shared link) keeps it.
  const param = router.query.tab;
  const tab = TABS.find(t => t.id === param)?.id ?? 'bust';
  
  // ?hero=ZEUS shows just that hero, centred, to focus on tweaking.
  const focus = HEROES.find(([id]) => id === router.query.hero)?.[0] ?? '';

  const setFocus = (id: string) => {
    const { hero: _drop, ...rest } = router.query;
    router.replace(
      { pathname: router.pathname, query: id ? { ...rest, hero: id } : rest },
      undefined,
      { shallow: true }
    );
  };

  const setTab = (id: string) =>
    router.replace(
      { pathname: router.pathname, query: { ...router.query, tab: id } },
      undefined,
      { shallow: true }
    );

  return (
    <main
      style={{
        padding: '24px 24px 96px',
        color: '#e8eaf2',
        background: '#14161c',
        position: 'fixed',
        inset: 0,
        overflow: 'auto',
        boxSizing: 'border-box'
      }}
    >
      <h1 style={{ margin: 0 }}>Hero lab</h1>
      <div style={{ display: 'flex', gap: 8, margin: '12px 0' }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              border: '1px solid #3a4052',
              cursor: 'pointer',
              color: '#fff',
              background: tab === t.id ? '#3d5afe' : '#232634'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      <p style={{ color: '#9aa3b8', maxWidth: 700 }}>
        {TABS.find(t => t.id === tab)?.note} Same art as /play (256 px).
      </p>
      <div
        style={{
          display: 'flex',
          gap: 24,
          alignItems: 'center',
          flexWrap: 'wrap',
          margin: '12px 0 36px'
        }}
      >
        <label>
          Health {health}{' '}
          <input
            type="range"
            min={1}
            max={30}
            value={health}
            onChange={e => setHealth(+e.target.value)}
          />
        </label>
        <label>
          Armor {armor}{' '}
          <input
            type="range"
            min={0}
            max={12}
            value={armor}
            onChange={e => setArmor(+e.target.value)}
          />
        </label>
        <label>
          Show{' '}
          <select value={focus} onChange={e => setFocus(e.target.value)}>
            <option value="">All heroes</option>
            {HEROES.map(([id, name]) => (
              <option key={id} value={id}>
                Only {name}
              </option>
            ))}
          </select>
        </label>
        {tab === 'figure' &&
          skillStates.map((st, i) => (
            <label key={i}>
              Skill {i + 1}{' '}
              <select
                value={st}
                onChange={e =>
                  setSkillStates(skillStates.map((x, j) => (j === i ? e.target.value : x)))
                }
              >
                {SKILL_STATES.map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
          ))}
        {tab === 'figure' && (
          <label>
            Weapon{' '}
            <select value={weapon} onChange={e => setWeapon(e.target.value)}>
              <option value="">None</option>
              {Object.entries(WEAPONS).map(([id, w]) => (
                <option key={id} value={id}>
                  {id} ({w.attack}/{w.durability})
                </option>
              ))}
            </select>
          </label>
        )}
        <label>
          <input
            type="checkbox"
            checked={active}
            onChange={e => setActive(e.target.checked)}
          />{' '}
          Their turn
        </label>
      </div>
      <div
        style={{
          display: 'flex',
          gap: '40px 40px',
          flexWrap: 'wrap',
          justifyContent: focus ? 'center' : 'flex-start',
          alignItems: focus ? 'center' : '',
          minHeight: focus ? '50vh' : ''
        }}
      >
        {HEROES.map(([id, name], i) => {
          if (focus && focus !== id) return null;
          const p = {
            heroId: id,
            name,
            health,
            armor,
            active,
            team: (i % 2 ? 'red' : 'green') as 'red' | 'green',
            turnTag: active ? 'Your turn' : ''
          };
          return tab === 'bust' ? (
            <HeroBust key={id} {...p} />
          ) : tab === 'figure' ? (
            <HeroFigure
              key={id}
              {...p}
              weapon={WEAPONS[weapon]}
              skills={skillStates.map((st, i) => skillFrom(st, i + 1, id))} />
          ) : tab === 'medal' ? (
            <HeroMedallion key={id} {...p} />
          ) : (
            <HeroCard key={id} {...p} />
          );
        })}
      </div>
    </main>
  );
};

export default HeroLab;
