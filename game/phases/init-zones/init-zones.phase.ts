import type { Ctx, PhaseConfig } from 'boardgame.io';
import type { GameState, Zone, Zones } from '../../../types';

import { zones } from '../../state';
import { fxEnd } from '../../config.bgio-effects';
import { createCardObject, createZoneObject, logPhaseToConsole } from '../../../utils';

import ZONE_DATABASE from '../../data/zones.json';
import setsCore from '../../../data/setsCore.json';
import core008Scenario from '../../debug/scenarios/core-008.scenario';
import core031Scenario from '../../debug/scenarios/core-031.scenario';
import core050Scenario from '../../debug/scenarios/core-050.scenario';
import core058Scenario from '../../debug/scenarios/core-058.scenario';
import healPlayerMinionScenario from '../../debug/scenarios/heal-player-minion.scenario';
import dealAoeDmgScenario from '../../debug/scenarios/deal-aoe-damage.scenario';
import opponentMinionsBoonScenario from '../../debug/scenarios/opponent-minions-have-boon.scenario';
import opponentMinionsBuffScenario from '../../debug/scenarios/opponent-minions-have-buff.scenario';

const db = [
  ...setsCore
]

const scenarios = {
  'core-008': core008Scenario,
  'core-031': core031Scenario,
  'core-050': core050Scenario,
  'core-058': core058Scenario,
  'heal-player-minion': healPlayerMinionScenario,
  'deal-aoe-damage': dealAoeDmgScenario,
  'opponent-minions-have-boon': opponentMinionsBoonScenario,
  'opponent-minions-have-buff': opponentMinionsBuffScenario,
} as Record<string, any>

export default<PhaseConfig> {
  next: 'revealZone',
  onBegin(G: GameState, ctx: Ctx) {
    const {
      gameConfig: {
        debugConfig,
        debugConfig: {
          debugBoardCardKey,
          debugBoardCardKeyAmount,
          debugOpponentBoardCardKey,
          debugOpponentBoardCardKeyAmount,
          debugScenario,
          useDebugBoardCardKey,
          useDebugOpponentBoardCardKey,
          useDebugScenario,
        },
        numerics: {
          numberOfZones
        }
      },
    } = G;
    const { random } = ctx;
    const randomZonesArray = random?.Shuffle(ZONE_DATABASE);
    const withUuid = true;
    let newZones: Zone[] = [];

    // push random zone entries to newZones arr
    for (let idx = 0; idx < numberOfZones; idx++) {
      let newZone = createZoneObject(randomZonesArray![idx], withUuid);
      newZones.push(newZone);
    }

    // set the zones to G state
    zones.set(G, newZones);

    // log phase info to console
    if (debugConfig.logPhaseToConsole) {
      const zone0 = `${newZones[0].name} (${newZones[0].id})`;
      const zone1 = `${newZones[1].name} (${newZones[1].id})`;
      const zone2 = `${newZones[2].name} (${newZones[2].id})`;

      logPhaseToConsole(G.turn, ctx.phase, undefined, {
        key: 'ZONES',
        value: `${zone0} | ${zone1} | ${zone2}`,
      });
    }

    // [your side] debug card or side interactions
    if (useDebugBoardCardKey && !useDebugScenario) {
      for (let index = 0; index < debugBoardCardKeyAmount; index++) {
        const debugCardBase = db.find(o => o.key === debugBoardCardKey);
        const debugCard = createCardObject(debugCardBase!);
        G.zones[0].sides['0'].push({ ...debugCard, revealed: true });
      }
    }

    // [their side] debug card or side interactions
    if (useDebugOpponentBoardCardKey && !useDebugScenario) {
      for (let index = 0; index < debugOpponentBoardCardKeyAmount; index++) {
        const debugCardBase = db.find(o => o.key === debugOpponentBoardCardKey);
        const debugCard = createCardObject(debugCardBase!);
        G.zones[0].sides['1'].push({ ...debugCard, revealed: true });
      }
    }

    // init possible debug scenario
    if (useDebugScenario) {
      const name = debugScenario;
      G.zones.forEach((z, zI) => {
        if (scenarios[name].zones[zI] && scenarios[name].zones[zI].sides['0']) {
          z.sides['0'] = scenarios[name].zones[zI].sides['0'];
        }

        if (scenarios[name].zones[zI] && scenarios[name].zones[zI].sides['1']) {
          z.sides['1'] = scenarios[name].zones[zI].sides['1'];
        }
      })
    }
  },
  endIf: (G: GameState) => zones.areReady(G),
  onEnd(G: GameState, ctx: Ctx) {
    fxEnd(ctx)
  },
};
