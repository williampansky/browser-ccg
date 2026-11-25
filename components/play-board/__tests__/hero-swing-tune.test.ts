import {
  getHeroSwing,
  MINION_SWING_DEFAULTS,
  MINION_SWING_KNOBS,
  setMinionSwingTuning,
  HERO_SWING_DEFAULTS,
  HERO_SWING_KNOBS,
  setHeroSwingTuning,
  swingFromQuery,
} from '../hero-swing-tune';
import {
  heroShadowFrames,
  minionShadowFrames,
  swingFrames,
  swingImpactMs,
} from '../motion';

describe('hero swing tuning', () => {
  afterEach(() => setHeroSwingTuning(undefined));

  it('keeps the defaults for a knob with no value, and reads the ones given', () => {
    const swing = swingFromQuery((key) => (key === 'lswi' ? '300' : ''));
    expect(swing.impactMs).toBe(300);
    expect(swing.totalMs).toBe(HERO_SWING_DEFAULTS.totalMs);
  });

  it('uses unique URL keys that the board script can bake', () => {
    const keys = HERO_SWING_KNOBS.map((knob) => knob.key);
    expect(new Set(keys).size).toBe(keys.length);
    keys.forEach((key) => expect(key).toMatch(/^l[a-z0-9]+$/));
    keys.forEach((key) => expect(key).not.toMatch(/pv$/));
  });

  it('lets the lab override what the swing and its impact time use', () => {
    setHeroSwingTuning({ ...getHeroSwing(), impactMs: 333, totalMs: 1200 });
    expect(swingImpactMs('hero')).toBe(333);
    const frames = swingFrames({ x: 100, y: 0 });
    expect(frames[3].offset).toBeCloseTo(333 / 1200);
  });
});

describe('swingFrames', () => {
  const frames = swingFrames({ x: 100, y: 0 }, HERO_SWING_DEFAULTS);

  it('starts and ends at rest', () => {
    expect(frames[0].transform).toBe('translate(0px, 0px) scale(1, 1)');
    expect(frames[frames.length - 1].transform).toBe(
      'translate(0px, 0px) scale(1, 1)',
    );
  });

  it('rises first, then reaches the target at the impact time', () => {
    expect(String(frames[1].transform)).toMatch(/translate\(0px, -22px\)/);
    expect(String(frames[3].transform)).toMatch(/translate\(85px/);
    expect(frames[3].offset).toBeCloseTo(
      HERO_SWING_DEFAULTS.impactMs / HERO_SWING_DEFAULTS.totalMs,
    );
  });

  it('keeps the offsets in order even for silly settings', () => {
    const silly = swingFrames(
      { x: 0, y: -100 },
      {
        ...HERO_SWING_DEFAULTS,
        liftMs: 900,
        impactMs: 50,
        slamMs: 400,
        holdMs: 5000,
      },
    );
    const offsets = silly.map((frame) => frame.offset as number);
    expect([...offsets].sort((a, b) => a - b)).toEqual(offsets);
  });
});

describe('heroShadowFrames', () => {
  const glow = 'drop-shadow(rgb(61, 220, 132) 0px 0px 16px)';
  const dark = 'drop-shadow(rgba(0, 0, 0, 0.65) 0px 8px 14px)';
  const frames = heroShadowFrames(`${glow} ${dark}`, HERO_SWING_DEFAULTS);

  it('starts and ends on the default shadow, so nothing pops', () => {
    expect(frames[0].filter).toBe(`${glow} ${dark}`);
    expect(frames[frames.length - 1].filter).toBe(`${glow} ${dark}`);
  });

  it('keeps the glow and replaces only the dark shadow while lifted', () => {
    const lifted = String(frames[1].filter);
    expect(lifted.startsWith(glow)).toBe(true);
    expect(lifted).toContain('0 26px 16px');
    expect(lifted).not.toContain(dark);
  });

  it('works for a figure with no filter at all', () => {
    const plain = heroShadowFrames('none', HERO_SWING_DEFAULTS);
    expect(plain[0].filter).toBe('none');
    expect(plain.length).toBe(8);
  });
});

describe('minion swing', () => {
  afterEach(() => setMinionSwingTuning(undefined));

  it('has its own URL keys, apart from the hero swing and all bakeable', () => {
    const heroKeys = HERO_SWING_KNOBS.map((knob) => knob.key);
    const minionKeys = MINION_SWING_KNOBS.map((knob) => knob.key);
    expect(new Set([...heroKeys, ...minionKeys]).size).toBe(
      heroKeys.length + minionKeys.length,
    );
    minionKeys.forEach((key) => expect(key).toMatch(/^l[a-z0-9]+$/));
    minionKeys.forEach((key) => expect(key).not.toMatch(/pv$/));
  });

  it('is lighter and quicker than the hero swing by default', () => {
    expect(MINION_SWING_DEFAULTS.totalMs).toBeLessThan(
      HERO_SWING_DEFAULTS.totalMs,
    );
    expect(MINION_SWING_DEFAULTS.liftY).toBeLessThan(HERO_SWING_DEFAULTS.liftY);
  });

  it('lands its impact at the minion impact time', () => {
    setMinionSwingTuning({ ...MINION_SWING_DEFAULTS, impactMs: 250 });
    expect(swingImpactMs('minion')).toBe(250);
    expect(swingImpactMs('hero')).toBe(getHeroSwing().impactMs);
  });
});

describe('minionShadowFrames', () => {
  const ring = 'rgb(61, 220, 132) 0px 0px 0px 3px';
  const edge = 'rgba(0, 0, 0, 0.9) 0px 0px 2px 0px';
  const dark = 'rgba(0, 0, 0, 0.55) 0px 3px 12px 0px';
  const inset = 'rgba(0, 0, 0, 0.35) 0px 0px 0px 2px inset';
  const frames = minionShadowFrames(
    [ring, edge, dark, inset].join(', '),
    MINION_SWING_DEFAULTS,
  );

  it('starts and ends on the default shadow', () => {
    expect(frames[0].boxShadow).toBe([ring, edge, dark, inset].join(', '));
    expect(frames[frames.length - 1].boxShadow).toBe(frames[0].boxShadow);
  });

  it('lifts only the last outer layer, keeping the ring, edge and inset', () => {
    const lifted = String(frames[1].boxShadow);
    expect(lifted).toContain(ring);
    expect(lifted).toContain(inset);
    expect(lifted).not.toContain(dark);
    expect(lifted).toContain(`0px ${MINION_SWING_DEFAULTS.shadowY}px`);
  });

  it('does nothing for a minion with no shadow', () => {
    expect(minionShadowFrames('none')).toEqual([]);
  });
});
