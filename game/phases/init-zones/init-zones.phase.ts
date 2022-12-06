import type { Ctx, PhaseConfig } from 'boardgame.io';
import type { GameState, Zone, Zones } from '../../../types';

import { zones } from '../../state';
import { fxEnd } from '../../config.bgio-effects';
import { createZoneObject, logPhaseToConsole } from '../../../utils';

import ZONE_DATABASE from '../../data/zones.json';
import healPlayerMinionScenario from '../../debug/scenarios/heal-player-minion.scenario';
import dealAoeDmgScenario from '../../debug/scenarios/deal-aoe-damage.scenario';

const scenarios = {
  'heal-player-minion': healPlayerMinionScenario,
  'deal-aoe-damage': dealAoeDmgScenario,
} as Record<string, any>

export default<PhaseConfig> {
  next: 'revealZone',
  onBegin(G: GameState, ctx: Ctx) {
    const { random } = ctx;
    const randomZonesArray = random?.Shuffle(ZONE_DATABASE);
    const withUuid = true;
    let newZones: Zone[] = [];

    for (let idx = 0; idx < G.gameConfig.numerics.numberOfZones; idx++) {
      let newZone = createZoneObject(randomZonesArray![idx], withUuid);
      newZones.push(newZone);
    }

    zones.set(G, newZones);
    // playerNames.set(G, '0', 'Player');
    // playerNames.set(G, '1', 'Opponent');

    // @ts-ignore
    ctx.effects?.fxEnd();

    if (G.gameConfig.debugConfig.logPhaseToConsole) {
      const zone0 = `${newZones[0].name} (${newZones[0].id})`;
      const zone1 = `${newZones[1].name} (${newZones[1].id})`;
      const zone2 = `${newZones[2].name} (${newZones[2].id})`;

      logPhaseToConsole(G.turn, ctx.phase, undefined, {
        key: 'ZONES',
        value: `${zone0} | ${zone1} | ${zone2}`,
      });
    }

    if (G.gameConfig.debugConfig.useDebugScenario) {
      const name = G.gameConfig.debugConfig.debugScenario;
      G.zones[0].sides[0] = scenarios[name].zones[0].sides[0];
      G.zones[0].sides[1] = scenarios[name].zones[0].sides[1];
    }
  },
  endIf: (G: GameState) => zones.areReady(G),
  onEnd(G: GameState, ctx: Ctx) {
    fxEnd(ctx)
  },
};
