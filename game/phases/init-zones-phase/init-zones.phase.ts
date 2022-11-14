import { Ctx, PhaseConfig } from 'boardgame.io';
import { GameState, Zone } from '../../../types';
import { zones } from '../../state';
import { createZoneObject, logPhaseToConsole } from '../../../utils';
import ZONE_DATABASE from '../../data/zones.json';

const initZonesPhase: PhaseConfig = {
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
    ctx.effects.effectsEnd();

    if (G.gameConfig.debugConfig.logPhaseToConsole) {
      const zone0 = `${newZones[0].name} (${newZones[0].id})`;
      const zone1 = `${newZones[1].name} (${newZones[1].id})`;
      const zone2 = `${newZones[2].name} (${newZones[2].id})`;

      logPhaseToConsole(G.turn, ctx.phase, {
        key: 'ZONES',
        value: `${zone0} | ${zone1} | ${zone2}`,
      });
    }
  },
  endIf: (G: GameState) => zones.areReady(G),
};

export default initZonesPhase;
