import { PlayerID, Zone } from '../types';
import getSumOfAllZonesPower from './get-sum-of-all-zones-power';
import getZonesWonBySide from './get-zone-wins-by-side';

const getGameResult = (zones: Zone[]): PlayerID | '' => {
  const numberOfZonesWonByPlayer0 = getZonesWonBySide(zones)['0'];
  const numberOfZonesWonByPlayer1 = getZonesWonBySide(zones)['1'];
  const player0TotalPower = getSumOfAllZonesPower(zones, '0');
  const player1TotalPower = getSumOfAllZonesPower(zones, '1');

  if (numberOfZonesWonByPlayer1 > numberOfZonesWonByPlayer0) {
    return '1';
  } else if (numberOfZonesWonByPlayer0 > numberOfZonesWonByPlayer1) {
    return '0';
  } else {
    if (player1TotalPower > player0TotalPower) {
      return '1';
    } else if (player0TotalPower > player1TotalPower) {
      return '0';
    } else {
      return ''; // draw
    }
  }

};

export default getGameResult;
