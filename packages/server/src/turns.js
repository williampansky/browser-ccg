import { TurnOrder } from 'boardgame.io/core';

export default {
  order: TurnOrder.CUSTOM_FROM('turnOrder'),
  onBegin: (G, ctx) => {}
};
