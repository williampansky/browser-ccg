import { useRouter } from 'next/router';
import { useState } from 'react';
import { getHero } from '../engine/heroes';
import { HeroBust } from '../components/play-board/HeroBust';
import {
  FigureSkill,
  HeroCard,
  HeroFigure,
  HeroMedallion,
  HeroRing,
  RING_DEFAULTS,
  RingTune,
} from '../components/play-board/HeroVariants';

const TABS = [
  {
    id: 'bust',
    label: '1 Bust',
    note: 'An arched portrait above a base plate; health and armor are gems.',
  },
  {
    id: 'figure',
    label: '2 Standing figure',
    note: 'A tall card in the TCG Vol 14 frame laid out like its sample: ribbon name, gems for health and armor, skills in the panel.',
  },
  {
    id: 'medal',
    label: '3 Medallion',
    note: 'A big round portrait: health is the outer arc, armor a thinner arc inside it.',
  },
  {
    id: 'card',
    label: '4 Card panel',
    note: 'The hero drawn like the hand cards, in the same frame art.',
  },
  {
    id: 'ring',
    label: '5 Ring + sockets',
    note: "A thin dark ring with the portrait inside; the stats orbit its rim like a watch face: skills at 9 o'clock (all three along the left), weapon at 3, a pill-shaped health badge at 6 and an armor pill beside it.",
  },
] as const;

const SKILL_STATES = [
  ['ready', 'Ready'],
  ['selected', 'Selected (aiming)'],
  ['cd1', 'Cooldown 1'],
  ['cd3', 'Cooldown 3'],
  ['spent', 'Used (ultimate)'],
  ['off', 'Disabled (no energy)'],
] as const;

/**
 * The hero's real skill n (name, cost, text from the data) in a chosen state;
 * heroes without skill code get placeholders.
 */
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
    targeted: !!real?.target,
  };
};

/**
 * Only the skills the hero has (skills 2 and 3 are shelved), each in its chosen
 * state, so a hero with one skill shows one socket.
 */
const heroSkillsFor = (states: string[], heroId: string): FigureSkill[] =>
  states.flatMap((state, index) => {
    const hasSkill = !!getHero(heroId)?.skills[index];

    return hasSkill ? [skillFrom(state, index + 1, heroId)] : [];
  });

/**
 * Prototype weapon art for the standing figure, keyed by card id (attack /
 * durability from data/core.json).
 */
const WEAPONS: Record<
  string,
  { image: string; attack: number; durability: number }
> = {
  CORE_076: {
    image: '/images/weapons/CORE_076-WEAPON.png',
    attack: 2,
    durability: 2,
  },
  CORE_100: {
    image: '/images/weapons/CORE_100-WEAPON.png',
    attack: 3,
    durability: 4,
  },
  CORE_081: {
    image: '/images/weapons/CORE_081-WEAPON.png',
    attack: 3,
    durability: 2,
  },
};

type NumKey = {
  [K in keyof RingTune]: RingTune[K] extends number ? K : never;
}[keyof RingTune];
type FlagKey = {
  [K in keyof RingTune]: RingTune[K] extends boolean ? K : never;
}[keyof RingTune];
type ColourKey =
  | 'ringColour'
  | 'socketColour'
  | 'hpFull'
  | 'hpGraze'
  | 'hpHurt'
  | 'hpLow'
  | 'hitColour'
  | 'healColour';
/**
 * The ring tab's number knobs. Each lives in the URL as `r_<field>` so a setup
 * can be copied.
 */
const RING_KNOBS: {
  field: NumKey;
  label: string;
  min: number;
  max: number;
  step?: number;
}[] = [
  { field: 'd', label: 'Ring diameter (px)', min: 60, max: 300 },
  { field: 'w', label: 'Ring thickness (px)', min: 0, max: 10 },
  { field: 'sock', label: 'Socket size (px)', min: 16, max: 64 },
  {
    field: 'rimSock',
    label: 'Sockets: out from the rim (px, minus = inside)',
    min: -30,
    max: 40,
  },
  {
    field: 'rimPill',
    label: 'Pills: out from the rim (px, minus = inside)',
    min: -30,
    max: 40,
  },
  {
    field: 'skillAngle',
    label: "Skills: middle one at (deg, 180 = 9 o'clock)",
    min: 0,
    max: 360,
    step: 5,
  },
  {
    field: 'skillSpacing',
    label: 'Skills: angle between them (deg)',
    min: 10,
    max: 90,
    step: 5,
  },
  {
    field: 'weaponAngle',
    label: "Weapon at (deg, 0 = 3 o'clock)",
    min: -180,
    max: 180,
    step: 5,
  },
  {
    field: 'hpAngle',
    label: "Health at (deg, 90 = 6 o'clock)",
    min: 0,
    max: 360,
    step: 5,
  },
  { field: 'armorAngle', label: 'Armor at (deg)', min: 0, max: 360, step: 5 },
  { field: 'armorW', label: 'Armor width (px)', min: 16, max: 100 },
  { field: 'armorH', label: 'Armor height (px)', min: 16, max: 100 },
  { field: 'armorFont', label: 'Armor number size (px)', min: 8, max: 40 },
  { field: 'wpnW', label: 'Weapon pills: width (px)', min: 12, max: 60 },
  { field: 'wpnH', label: 'Weapon pills: height (px)', min: 12, max: 60 },
  {
    field: 'wpnFont',
    label: 'Weapon pills: number size (px)',
    min: 8,
    max: 30,
  },
  { field: 'atkX', label: 'Attack pill: nudge right (px)', min: -40, max: 40 },
  { field: 'atkY', label: 'Attack pill: nudge down (px)', min: -40, max: 40 },
  {
    field: 'durX',
    label: 'Durability pill: nudge right (px)',
    min: -40,
    max: 40,
  },
  {
    field: 'durY',
    label: 'Durability pill: nudge down (px)',
    min: -40,
    max: 40,
  },
  {
    field: 'rimArmor',
    label: 'Armor: out from the rim (px, minus = inside)',
    min: -40,
    max: 40,
  },
  { field: 'pillW', label: 'Pill width (px)', min: 24, max: 100 },
  { field: 'pillH', label: 'Pill height (px)', min: 14, max: 44 },
  { field: 'pillFont', label: 'Pill number size (px)', min: 9, max: 30 },
  {
    field: 'hpArcStart',
    label: "Health arc: fills from (deg, 180 = 9 o'clock)",
    min: -180,
    max: 360,
    step: 5,
  },
  {
    field: 'hpArcEnd',
    label: "Health arc: to (deg, 360 = 3 o'clock, over the top)",
    min: -180,
    max: 360,
    step: 5,
  },
  {
    field: 'hpArcOffset',
    label: 'Health arc: out from the rim (px)',
    min: -20,
    max: 60,
  },
  { field: 'hpArcWidth', label: 'Health arc: thickness (px)', min: 2, max: 24 },
  {
    field: 'liquidBand',
    label: 'Health liquid: ring width (px)',
    min: 8,
    max: 60,
  },
  {
    field: 'liquidBubbles',
    label: 'Health liquid: bubbles per side',
    min: 0,
    max: 24,
  },
  {
    field: 'bezel',
    label: 'Metal bezel behind the disc (%, 0 = off, 100 = flush)',
    min: 0,
    max: 160,
    step: 5,
  },
  {
    field: 'frame',
    label:
      'Metal frame picture on skills and weapon (px across, 0 = off; about socket size ÷ 0.47 fits)',
    min: 0,
    max: 160,
  },
  {
    field: 'mysteryAngle',
    label: "Mystery socket at (deg, 0 = 3 o'clock)",
    min: -180,
    max: 360,
    step: 5,
  },
  {
    field: 'hitShake',
    label: 'Hit shake: sideways (px, 0 = none)',
    min: 0,
    max: 30,
    step: 0.5,
  },
  {
    field: 'hitTilt',
    label: 'Hit shake: tilt (deg)',
    min: 0,
    max: 15,
    step: 0.25,
  },
  {
    field: 'hitShakeMs',
    label: 'Hit shake: length (ms)',
    min: 100,
    max: 1500,
    step: 10,
  },
  {
    field: 'hitDelay',
    label: 'Hit: delay before shake and number (ms)',
    min: 0,
    max: 800,
    step: 10,
  },
  { field: 'popSize', label: 'Damage number: size (px)', min: 12, max: 90 },
  { field: 'popRise', label: 'Damage number: rises (px)', min: 0, max: 200 },
  {
    field: 'popMs',
    label: 'Damage number: length (ms)',
    min: 200,
    max: 3000,
    step: 50,
  },
  {
    field: 'popY',
    label: 'Damage number: starts at (% down the disc)',
    min: 0,
    max: 100,
  },
  {
    field: 'liquidAlpha',
    label: 'Health liquid: opacity (%)',
    min: 10,
    max: 100,
    step: 5,
  },
];
const RING_COLOURS: { field: ColourKey; label: string }[] = [
  { field: 'ringColour', label: 'Ring colour' },
  { field: 'socketColour', label: 'Socket colour' },
  { field: 'hpFull', label: 'Health: full' },
  { field: 'hpGraze', label: 'Health: scratched (over two thirds)' },
  { field: 'hpHurt', label: 'Health: hurt (over a third)' },
  { field: 'hpLow', label: 'Health: low (a third or less)' },
  { field: 'hitColour', label: 'Damage number' },
  { field: 'healColour', label: 'Heal number' },
];
const RING_FLAGS: { field: FlagKey; label: string }[] = [
  { field: 'showName', label: 'Name' },
  { field: 'showTag', label: 'Turn tag' },
  { field: 'showCost', label: 'Skill costs' },
  { field: 'hpArc', label: 'Health arc' },
  { field: 'hpLiquid', label: 'Health liquid' },
  { field: 'showPop', label: 'Damage / heal numbers' },
];

const HEROES = [
  ['WIZARD', 'Wizard'],
  ['ASSASSIN', 'Assassin'],
  ['RANGER', 'Ranger'],
  ['CLERIC', 'Cleric'],
  ['FIGHTER', 'Fighter'],
  ['WARDEN', 'Warden'],
];

/**
 * PROTOTYPE page: the "bust" hero display with the real hero art (dev only, not
 * linked).
 */
const HeroLab = () => {
  const [health, setHealth] = useState(30);
  const [armor, setArmor] = useState(0);
  const [active, setActive] = useState(true);
  const [weapon, setWeapon] = useState('CORE_076');
  const [mystery, setMystery] = useState<'' | 'mine' | 'foe'>('');
  const [skillStates, setSkillStates] = useState(['ready', 'cd3', 'spent']);
  const router = useRouter();

  /** The tab lives in ?tab= so a refresh (or a shared link) keeps it. */
  const param = router.query.tab;
  const tab = TABS.find((t) => t.id === param)?.id ?? 'bust';

  /** ?hero=ZEUS shows just that hero, centred, to focus on tweaking. */
  const focus = HEROES.find(([id]) => id === router.query.hero)?.[0] ?? '';

  const setFocus = (id: string) => {
    const { hero: _drop, ...rest } = router.query;
    router.replace(
      { pathname: router.pathname, query: id ? { ...rest, hero: id } : rest },
      undefined,
      { shallow: true },
    );
  };

  /**
   * The ring tab's settings come from the URL (`r_<field>`), over the defaults.
   */
  const q1 = (k: string) =>
    (Array.isArray(router.query[k])
      ? router.query[k]?.[0]
      : (router.query[k] as string | undefined)) ?? '';
  const ring: RingTune = { ...RING_DEFAULTS };
  RING_KNOBS.forEach((k) => {
    const v = q1(`r_${k.field}`);
    if (v !== '' && !Number.isNaN(+v)) ring[k.field] = +v;
  });
  RING_COLOURS.forEach((c) => {
    const v = q1(`r_${c.field}`);
    if (/^[0-9a-f]{6}$/i.test(v)) ring[c.field] = v;
  });
  RING_FLAGS.forEach((f) => {
    const v = q1(`r_${f.field}`);
    if (v === '0') ring[f.field] = false;
    else if (v === '1') ring[f.field] = true;
  });
  const setRing = (changes: Record<string, string | null>) => {
    const query = { ...router.query };
    Object.entries(changes).forEach(([k, v]) =>
      v === null ? delete query[k] : (query[k] = v),
    );
    router.replace({ pathname: router.pathname, query }, undefined, {
      shallow: true,
    });
  };
  const resetRing = () =>
    setRing(
      Object.fromEntries(
        Object.keys(router.query)
          .filter((k) => k.startsWith('r_'))
          .map((k) => [k, null]),
      ),
    );

  const setTab = (id: string) =>
    router.replace(
      { pathname: router.pathname, query: { ...router.query, tab: id } },
      undefined,
      { shallow: true },
    );

  const GROUPS: { title: string; open?: boolean; fields: NumKey[] }[] = [
    { title: 'Size', open: true, fields: ['d', 'w', 'sock', 'bezel', 'frame'] },
    {
      title: 'Where things sit',
      open: true,
      fields: [
        'rimSock',
        'rimPill',
        'rimArmor',
        'skillAngle',
        'skillSpacing',
        'weaponAngle',
        'mysteryAngle',
        'hpAngle',
        'armorAngle',
      ],
    },
    {
      title: 'Health and armor pills',
      fields: ['pillW', 'pillH', 'pillFont', 'armorW', 'armorH', 'armorFont'],
    },
    {
      title: 'Weapon pills',
      fields: ['wpnW', 'wpnH', 'wpnFont', 'atkX', 'atkY', 'durX', 'durY'],
    },
    {
      title: 'Hit shake and damage number',
      fields: [
        'hitShake',
        'hitTilt',
        'hitShakeMs',
        'hitDelay',
        'popSize',
        'popRise',
        'popMs',
        'popY',
      ],
    },
    {
      title: 'Health liquid',
      fields: ['liquidBand', 'liquidBubbles', 'liquidAlpha'],
    },
    {
      title: 'Health arc',
      fields: ['hpArcStart', 'hpArcEnd', 'hpArcOffset', 'hpArcWidth'],
    },
  ];
  const knob = (k: (typeof RING_KNOBS)[number]) => {
    const changed = q1(`r_${k.field}`) !== '';
    return (
      <label
        key={k.field}
        style={{ display: 'block', margin: '6px 0', fontSize: 12 }}
      >
        <span
          style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}
        >
          <span style={{ color: changed ? '#fff' : '#9aa3b8' }}>{k.label}</span>
          <span>
            <b>{ring[k.field]}</b>
            {changed && (
              <a
                style={{ marginLeft: 6, cursor: 'pointer', color: '#7aa2ff' }}
                onClick={() => setRing({ [`r_${k.field}`]: null })}
              >
                reset
              </a>
            )}
          </span>
        </span>
        <input
          type="range"
          min={k.min}
          max={k.max}
          step={k.step ?? 1}
          value={ring[k.field]}
          style={{ display: 'block', width: '100%', margin: 0 }}
          onChange={(e) => setRing({ [`r_${k.field}`]: e.target.value })}
        />
      </label>
    );
  };
  const summary = {
    cursor: 'pointer',
    fontWeight: 600,
    padding: '6px 0',
  } as const;
  const ringPanel = (
    <aside
      style={{
        flex: '0 0 320px',
        overflow: 'auto',
        paddingRight: 12,
        paddingBottom: 48,
        borderRight: '1px solid #2a2f3d',
      }}
    >
      <button
        onClick={resetRing}
        style={{
          padding: '4px 12px',
          borderRadius: 6,
          border: '1px solid #3a4052',
          background: '#232634',
          color: '#fff',
          cursor: 'pointer',
        }}
      >
        Reset ring
      </button>
      <small style={{ color: '#9aa3b8', display: 'block', margin: '6px 0' }}>
        Settings are in the page URL: copy it to keep or share a setup.
      </small>
      {GROUPS.map((g) => (
        <details
          key={g.title}
          open={g.open}
          style={{ borderTop: '1px solid #2a2f3d' }}
        >
          <summary style={summary}>{g.title}</summary>
          {g.fields.map((f) => knob(RING_KNOBS.find((k) => k.field === f)!))}
        </details>
      ))}
      <details style={{ borderTop: '1px solid #2a2f3d' }}>
        <summary style={summary}>Colours</summary>
        {RING_COLOURS.map((c) => (
          <label
            key={c.field}
            style={{ display: 'block', margin: '6px 0', fontSize: 12 }}
          >
            <input
              type="color"
              value={`#${ring[c.field]}`}
              onChange={(e) =>
                setRing({ [`r_${c.field}`]: e.target.value.slice(1) })
              }
            />{' '}
            {c.label}
          </label>
        ))}
      </details>
      <details open style={{ borderTop: '1px solid #2a2f3d' }}>
        <summary style={summary}>Show</summary>
        {RING_FLAGS.map((f) => (
          <label
            key={f.field}
            style={{ display: 'block', margin: '6px 0', fontSize: 12 }}
          >
            <input
              type="checkbox"
              checked={ring[f.field]}
              onChange={(e) =>
                setRing({ [`r_${f.field}`]: e.target.checked ? '1' : '0' })
              }
            />{' '}
            {f.label}
          </label>
        ))}
      </details>
    </aside>
  );

  return (
    <main
      style={{
        padding: '24px 24px 0',
        color: '#e8eaf2',
        background: '#14161c',
        position: 'fixed',
        inset: 0,
        overflow: tab === 'ring' ? 'hidden' : 'auto',
        display: tab === 'ring' ? 'flex' : 'block',
        flexDirection: 'column',
        boxSizing: 'border-box',
      }}
    >
      <h1 style={{ margin: 0 }}>Hero lab</h1>
      <div style={{ display: 'flex', gap: 8, margin: '12px 0' }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              border: '1px solid #3a4052',
              cursor: 'pointer',
              color: '#fff',
              background: tab === t.id ? '#3d5afe' : '#232634',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      <p style={{ color: '#9aa3b8', maxWidth: 700 }}>
        {TABS.find((t) => t.id === tab)?.note} Same art as /play (256 px).
      </p>
      <div
        style={
          tab === 'ring'
            ? { display: 'flex', gap: 24, flex: 1, minHeight: 0 }
            : undefined
        }
      >
        {tab === 'ring' && ringPanel}
        <div
          style={
            tab === 'ring'
              ? { flex: 1, minWidth: 0, overflow: 'auto', paddingBottom: 48 }
              : undefined
          }
        >
          <div
            style={{
              display: 'flex',
              gap: 24,
              alignItems: 'center',
              flexWrap: 'wrap',
              margin: '12px 0 36px',
            }}
          >
            <label>
              Health {health}{' '}
              <input
                type="range"
                min={1}
                max={30}
                value={health}
                onChange={(e) => setHealth(+e.target.value)}
              />
            </label>
            {tab === 'ring' && (
              <span style={{ display: 'inline-flex', gap: 6 }}>
                {(
                  [
                    ['Hit 3', -3],
                    ['Hit 8', -8],
                    ['Heal 3', 3],
                  ] as const
                ).map(([label, n]) => (
                  <button
                    key={label}
                    onClick={() =>
                      setHealth((h) => Math.min(30, Math.max(1, h + n)))
                    }
                    style={{
                      padding: '4px 10px',
                      borderRadius: 6,
                      border: '1px solid #3a4052',
                      background: '#232634',
                      color: '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </span>
            )}
            <label>
              Armor {armor}{' '}
              <input
                type="range"
                min={0}
                max={12}
                value={armor}
                onChange={(e) => setArmor(+e.target.value)}
              />
            </label>
            <label>
              Show{' '}
              <select value={focus} onChange={(e) => setFocus(e.target.value)}>
                <option value="">All heroes</option>
                {HEROES.map(([id, name]) => (
                  <option key={id} value={id}>
                    Only {name}
                  </option>
                ))}
              </select>
            </label>
            {(tab === 'figure' || tab === 'ring') &&
              skillStates.map((st, i) => (
                <label key={i}>
                  Skill {i + 1}{' '}
                  <select
                    value={st}
                    onChange={(e) =>
                      setSkillStates(
                        skillStates.map((x, j) =>
                          j === i ? e.target.value : x,
                        ),
                      )
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
            {tab === 'ring' && (
              <label>
                Mystery{' '}
                <select
                  value={mystery}
                  onChange={(e) =>
                    setMystery(e.target.value as '' | 'mine' | 'foe')
                  }
                >
                  <option value="">None</option>
                  <option value="mine">Yours (card art)</option>
                  <option value="foe">Opponent's (?)</option>
                </select>
              </label>
            )}
            {(tab === 'figure' || tab === 'ring') && (
              <label>
                Weapon{' '}
                <select
                  value={weapon}
                  onChange={(e) => setWeapon(e.target.value)}
                >
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
                onChange={(e) => setActive(e.target.checked)}
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
              minHeight: focus ? '50vh' : '',
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
                turnTag: active ? 'Your turn' : '',
              };
              return tab === 'bust' ? (
                <HeroBust key={id} {...p} />
              ) : tab === 'figure' ? (
                <HeroFigure
                  key={id}
                  {...p}
                  weapon={WEAPONS[weapon]}
                  skills={heroSkillsFor(skillStates, id)}
                />
              ) : tab === 'medal' ? (
                <HeroMedallion key={id} {...p} />
              ) : tab === 'ring' ? (
                <HeroRing
                  key={id}
                  {...p}
                  tune={ring}
                  mystery={
                    mystery === 'mine'
                      ? {
                          cardId: 'CORE_001',
                          name: 'Sample Mystery (Attack)',
                          tip: "The card's text shows here for its owner.",
                        }
                      : mystery === 'foe'
                        ? {
                            name: 'Mystery (Attack)',
                            tip: 'Reacts when you attack.',
                          }
                        : undefined
                  }
                  weapon={WEAPONS[weapon]}
                  skills={heroSkillsFor(skillStates, id)}
                />
              ) : (
                <HeroCard key={id} {...p} />
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
};

export default HeroLab;
