import { Ctx } from 'boardgame.io';

export default function noStageActive(ctx: Ctx) {
  return ctx.activePlayers === null ? true : false;
}
