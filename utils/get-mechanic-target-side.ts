import type { Card, PlayerID } from "../types";
import { CardMechanicsSide } from "../enums";
import getContextualPlayerIds from "./get-contextual-player-ids";

export default function getMechanicTargetSide(c: Card, player: PlayerID) {
  const { opponent } = getContextualPlayerIds(player);
  switch (c.mechanicsSide) {
    case CardMechanicsSide.Player:
      return player;
    case CardMechanicsSide.Opponent:
      return opponent;
    default:
      return CardMechanicsSide.Both;
  }
};
