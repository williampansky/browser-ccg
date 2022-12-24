import { Ctx } from "boardgame.io";
import { PlayerID } from "../types";
import isBotGame from "./is-bot-game";

export default function isBotTurn(ctx: Ctx, player?: PlayerID) {
  if (player) {
    return isBotGame(ctx) && player === '1' ? true : false;
  }

  return isBotGame(ctx) && ctx.currentPlayer === '1' ? true : false;
}
