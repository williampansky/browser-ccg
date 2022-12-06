import { Ctx } from "boardgame.io";
import { GameState } from "../types";
import { calculateZoneSidePower } from "../utils";

export default function handleZonePowersCalculations(G: GameState, ctx: Ctx) {
  G.zones.forEach((zone, zoneIdx) => {
    zone.powers['0'] = calculateZoneSidePower(G, zoneIdx, '0');
    zone.powers['1'] = calculateZoneSidePower(G, zoneIdx, '1');
  })
}
