import { add } from "mathjs";
import { Zone } from "../types";

interface ZonesWonBySide {
  '0': number;
  '1': number;
}

const getZonesWonBySide = (zones: Zone[]): ZonesWonBySide => {
  let zonesWon = { '0': 0, '1': 0 };

  const zone1 = {
    '0': zones[0].powers['0'],
    '1': zones[0].powers['1'],
  }

  const zone2 = {
    '0': zones[1].powers['0'],
    '1': zones[1].powers['1'],
  }

  const zone3 = {
    '0': zones[2].powers['0'],
    '1': zones[2].powers['1'],
  }

  if (zone1['1'] > zone1['0']) zonesWon['1'] = add(zonesWon['1'], 1);
  else if (zone1['0'] > zone1['1']) zonesWon['0'] = add(zonesWon['0'], 1);

  if (zone2['1'] > zone2['0']) zonesWon['1'] = add(zonesWon['1'], 1);
  else if (zone2['0'] > zone2['1']) zonesWon['0'] = add(zonesWon['0'], 1);

  if (zone3['1'] > zone3['0']) zonesWon['1'] = add(zonesWon['1'], 1);
  else if (zone3['0'] > zone3['1']) zonesWon['0'] = add(zonesWon['0'], 1);

  return zonesWon;
}

export default getZonesWonBySide