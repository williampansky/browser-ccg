import fs from 'fs';
import path from 'path';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { plan } = require('../apply-spell-url.node.js');

const PLAY = path.join(__dirname, '..', '..', 'components', 'play-board');
const tuneSrc = fs.readFileSync(path.join(PLAY, 'spell-fx-tune.ts'), 'utf8');
const fxSrc = fs.readFileSync(path.join(PLAY, 'spell-fx.ts'), 'utf8');
const classKeys = ['FIGHTER', 'WIZARD'];
const run = (url: string, isDefaults = false, texts = { tuneSrc, fxSrc }) =>
  plan({
    url,
    isDefaults,
    ...texts,
    classKeys,
    cardExists: (id: string) => id === 'CORE_069',
  });

describe('apply-spell-url plan', () => {
  it('writes a skill variant and leaves default-valued fields out', () => {
    const result = run(
      'sp=FIGHTER:1&s_spotColour=748ae2&s_spotHasGlow=1&s_spotSparkCount=20',
    );
    expect(result.errors).toEqual([]);
    expect(result.tune).toContain("'FIGHTER:1': {");
    expect(result.tune).toContain("spotColour: '748ae2',");
    expect(result.tune).toContain('spotSparkCount: 20,');
    const entry = result.tune.split("'FIGHTER:1': {")[1].split('},')[0];
    expect(entry).not.toContain('spotHasGlow');
    expect(result.tune).toContain('export const tuneForSpell');
  });

  it('merges over an earlier variant and drops a field set back to default', () => {
    const first = run('sp=CORE_069&s_travelMs=500&s_travelArc=0.2');
    const second = run('sp=CORE_069&s_travelMs=280&s_travelEase=3', false, {
      tuneSrc: first.tune,
      fxSrc,
    });
    expect(second.tune).not.toContain('travelMs: 500');
    expect(second.tune).toContain('travelArc: 0.2,');
    expect(second.tune).toContain('travelEase: 3,');
  });

  it('assigns a base to a card or a skill, and removes the default one', () => {
    const card = run('sp=CORE_069&e=strike');
    expect(card.fx).toContain("'CORE_069': 'strike',");
    const back = run('sp=CORE_069&e=travel', false, {
      tuneSrc,
      fxSrc: card.fx,
    });
    expect(back.fx).not.toContain('CORE_069');
    expect(run('sp=FIGHTER:1&e=spot').changes).toEqual([]);
  });

  it('bakes into the defaults with --defaults', () => {
    const result = run('s_travelMs=300', true);
    expect(result.tune).toContain('travelMs: 300,');
    expect(result.changes).toEqual(['default travelMs: 280 -> 300']);
  });

  it('writes nothing for a bad spell, field or value', () => {
    expect(run('sp=NOPE_1&s_travelMs=1').errors.length).toBeGreaterThan(0);
    expect(run('sp=CORE_069&s_travelNope=1').errors.length).toBeGreaterThan(0);
    expect(run('sp=CORE_069&s_travelMs=fast').errors.length).toBeGreaterThan(0);
    expect(run('sp=CORE_069&e=meteor').errors.length).toBeGreaterThan(0);
    expect(run('s_travelMs=1').errors.length).toBeGreaterThan(0);
  });
});
