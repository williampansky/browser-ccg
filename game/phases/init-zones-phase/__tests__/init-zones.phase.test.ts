import { defaultState } from '../../../state';
import { mockCtx } from '../../../test-utils';
import { initZonesPhase } from '..';

describe('Handles state manipulation of G.zones', () => {
  test('Should create three unique zone objects during onBegin()', () => {
    let G = defaultState;
    initZonesPhase.onBegin!(G, mockCtx());

    expect(G.zones[0].uuid).not.toBeUndefined();
    expect(G.zones[0].uuid).not.toBe('');
    expect(G.zones[0].id).not.toBe(G.zones[1].id);
    expect(G.zones[0].id).not.toBe(G.zones[2].id);

    expect(G.zones[1].uuid).not.toBeUndefined();
    expect(G.zones[1].uuid).not.toBe('');
    expect(G.zones[1].id).not.toBe(G.zones[0].id);
    expect(G.zones[1].id).not.toBe(G.zones[2].id);

    expect(G.zones[2].uuid).not.toBeUndefined();
    expect(G.zones[2].uuid).not.toBe('');
    expect(G.zones[2].id).not.toBe(G.zones[0].id);
    expect(G.zones[2].id).not.toBe(G.zones[1].id);
  });

  test('Should get true from Zones.areReady during endIf()', () => {
    let G = defaultState;
    initZonesPhase.onBegin!(G, mockCtx());
    
    const check = initZonesPhase.endIf!(G, mockCtx());
    expect(check).toBe(true);
  });
});
