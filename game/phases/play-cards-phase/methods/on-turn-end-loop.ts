import type { Ctx } from "boardgame.io";
import type { Card, GameState, PlayerID } from "../../../../types"
import { filterArray } from "../../../../utils";
import { InitGameMechanic, initTurnEnd } from "../../../mechanics";
import resetCardBooleans from "./reset-card-booleans";

const loop = (G: GameState, ctx: Ctx, zoneIdx: number, playerId: PlayerID) => {
  G.zones[zoneIdx].sides[playerId].forEach((card: Card, cardIdx) => {
    if (card.booleans.isDestroyed) {
      filterArray(G.zones[zoneIdx].sides[playerId], card.uuid, cardIdx);
    }

    resetCardBooleans(card);

    const props: InitGameMechanic = {
      G,
      ctx,
      zone: G.zones[zoneIdx],
      zoneIdx,
      card,
      cardIdx,
      player: playerId,
    };

    const turnEnd = (cb?: () => void) => initTurnEnd({ ...props }, cb);
    turnEnd();
  });
}

const onTurnEndLoop = (G: GameState, ctx: Ctx)=> {
  G.zones.forEach((_, zoneIdx) => {
    loop(G, ctx, zoneIdx, '0');
    loop(G, ctx, zoneIdx, '1');
  });
}

export default onTurnEndLoop;
