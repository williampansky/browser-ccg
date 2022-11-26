import type { GameState, Zone } from '../../../../types';

/**
 * Updates the G.zonesCardsReference for each player
 */
const updateZoneCardsReference = (G: GameState): void => {
  G.zones.forEach((z: Zone, i: number) => {
    G.zonesCardsReference[i]['0'] = z.sides['0'];
    G.zonesCardsReference[i]['1'] = z.sides['1'];
  });
};

export default updateZoneCardsReference;
