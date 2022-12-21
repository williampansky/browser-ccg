import { Ctx } from "boardgame.io";
import isBotGame from "./is-bot-game";

export default function isBotTurn(ctx: Ctx) {
  return isBotGame(ctx) && ctx.currentPlayer === '1' ? true : false;
}
