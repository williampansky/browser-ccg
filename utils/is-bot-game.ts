import { Ctx } from "boardgame.io";

export default function isBotGame(ctx: Ctx) {
  return ctx.numPlayers === 1 ? true : false;
}
