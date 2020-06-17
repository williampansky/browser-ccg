import { TurnOrder } from 'boardgame.io/core';
import boards from '../state/boards';
import counts from '../state/counts';
import drawCardAtStartOfTurn from '../utils/draw-turn-start-card';
import getCardByID from '../utils/get-card-by-id';
import playerCanAttack from '../state/player-can-attack';
import playerIsDisabled from '../state/player-is-disabled';

// onBegin methods used
import {
  incrementAndSetTotalActionPoints,
  resetSlotAttackBoon,
  disableSlotCanBeAttacked,
  enableSlotCanAttack,
  handleDisabledMechanic,
  handleExpirationMechanic,
  handlePlayerCanAttack,
  resetInteractionStates,
  handleDebugStates
} from './play-methods';

const onBegin = (G, ctx) => {
  const { turnOrder } = G;
  const { currentPlayer } = ctx;
  const otherPlayer = turnOrder.find(p => p !== currentPlayer);

  incrementAndSetTotalActionPoints(G, currentPlayer);
  drawCardAtStartOfTurn(G, ctx);

  G.boards[currentPlayer].forEach((slot, i) => {
    disableSlotCanBeAttacked(slot);
    enableSlotCanAttack(slot);
    resetSlotAttackBoon(slot);
    handleDisabledMechanic(slot);
    handleExpirationMechanic(slot);
  });

  G.boards[otherPlayer].forEach((slot, i) => {
    resetSlotAttackBoon(slot);
    handleDisabledMechanic(slot);
    handleExpirationMechanic(slot);
  });

  // reset isDisabled state back to false
  playerIsDisabled.disable(G, currentPlayer);

  // // either set attack value to weapon's attack
  // if (G.playerWeapon[currentPlayer] !== null) {
  //   const atkValue = G.playerWeapon[currentPlayer].attack;
  //   playerAttackValue.set(G, currentPlayer, atkValue);
  // } else {
  //   // or reset playerAttackValue state back to false
  //   playerAttackValue.reset(G, currentPlayer);
  // }

  // if player has enough actionPoints; enable playerCanUseClassSkill
  // if (!G.serverConfig.debugData.enableCost)
  // playerCanUseClassSkill.enable(G, currentPlayer);
  // else if (G.actionPoints[currentPlayer].current >= 2)
  // playerCanUseClassSkill.enable(G, currentPlayer);

  handlePlayerCanAttack(G, currentPlayer);
  resetInteractionStates(G);
  handleDebugStates(G, currentPlayer);
};

const onEnd = (G, ctx) => {
  // reset player[0] minion states
  G.boards['0'].forEach((slot, i) => {
    G.boards['0'][i] = {
      ...slot,
      canAttack: false,
      canBeAttackedByMinion: false,
      canBeAttackedByPlayer: false,
      canBeAttackedBySpell: false,
      canBeAttackedByWarcry: false,
      canBeBuffed: false,
      canBeHealed: false,
      isAttacking: false,
      isAttackingMinionIndex: null,
      isAttackingMinionPlayer: false
    };
  });

  // reset player[1] minion states
  G.boards['1'].forEach((slot, i) => {
    G.boards['1'][i] = {
      ...slot,
      canAttack: false,
      canBeAttackedByMinion: false,
      canBeAttackedByPlayer: false,
      canBeAttackedBySpell: false,
      canBeAttackedByWarcry: false,
      canBeBuffed: false,
      canBeHealed: false,
      isAttacking: false,
      isAttackingMinionIndex: null,
      isAttackingMinionPlayer: false
    };
  });

  // reset player states
  G.playerCanAttack = { '0': false, '1': false };
  G.playerCanBeAttackedByMinion = { '0': false, '1': false };
  G.playerCanBeAttackedByPlayer = { '0': false, '1': false };
  G.playerCanBeAttackedBySpell = { '0': false, '1': false };
  G.playerCanBeAttackedByWarcry = { '0': false, '1': false };
  G.playerCanBeHealed = { '0': false, '1': false };
  G.playerHasAttacked = { '0': false, '1': false };
  G.playerIsAttacking = { '0': false, '1': false };

  // reset card states
  G.hoveringCardIndex = { '0': null, '1': null };
  G.selectedCardIndex = { '0': null, '1': null };
  G.selectedCardObject = { '0': null, '1': null };

  // reset minion states
  G.selectedMinionIndex = { '0': null, '1': null };
  G.selectedMinionObject = { '0': null, '1': null };
  G.attackedMinionIndex = null;

  // reset warcry states
  G.warcryObject = { '0': null, '1': null };

  // reset animation states
  // G.animationStates.playerIsAttackingPlayer['0'] = false;
  // G.animationStates.playerIsAttackingPlayer['1'] = false;
};

export default {
  turn: {
    order: TurnOrder.CUSTOM_FROM('turnOrder'),
    onBegin: (G, ctx) => onBegin(G, ctx),
    onEnd: (G, ctx) => onEnd(G, ctx)
  }
};
