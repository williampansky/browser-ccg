// // prettier-ignore
// import { _dMCA, _dAMCA, _eMCA, _eAMCA } from 'lib/state/board-methods/can-attack';
// // prettier-ignore
// import { _dMCBA, _dAMCBA, _eMCBA, _eAMCBA } from 'lib/state/board-methods/can-be-attacked';
// // prettier-ignore
// import { _dMCBB, _dAMCBB, _eMCBB, _eAMCBB } from 'lib/state/board-methods/can-be-buffed';
// // prettier-ignore
// import { _dMCBH, _dAMCBH, _eMCBH, _eAMCBH } from 'lib/state/board-methods/can-be-healed';
// // prettier-ignore
// import { _dAMT, _dBT, _dHT, _dST, _dWT } from 'lib/state/board-methods/determinations';
// import { _kM, _kM0 } from 'lib/state/board-methods/kill-minion';
// import { _aTMH, _sFMH } from 'lib/state/board-methods/minion-health';
// import { _pC } from 'lib/state/board-methods/place-card-on-board';
import createBoardSlotObject from '../creators/create-board-slot-object';

// createBoardSlotObject('CORE_057b')
// prettier-ignore
const boards = {
  __DATA_MODEL: {
    '0': [
      { ...createBoardSlotObject('CORE_001') },
      { ...createBoardSlotObject('CORE_002'), hasBulwark: true },
      { ...createBoardSlotObject('CORE_003'), hasBoon: true },
      // { ...createBoardSlotObject('CORE_004') },
      // { ...createBoardSlotObject('CORE_005') },
      // { ...createBoardSlotObject('CORE_006') },
      // { ...createBoardSlotObject('CORE_062') }
    ],
    '1': [
      { ...createBoardSlotObject('CORE_004') },
      { ...createBoardSlotObject('CORE_005'), hasRush: true },
      { ...createBoardSlotObject('CORE_006') },
      { ...createBoardSlotObject('CORE_007'), hasNoAttack: true },
      // { ...createBoardSlotObject('CORE_008') },
      // { ...createBoardSlotObject('CORE_009') },
      // { ...createBoardSlotObject('CORE_130') }
    ]
  },

  // minion health
  // addToMinionHealth: (G, player, index, amount) => _aTMH(G, player, index, amount),
  // subtractFromMinionHealth: (G, player, index, amount) => _sFMH(G, player, index, amount),

  // target determination
  // determineAttackTargets: (G, player) => _dAMT(G, player),
  // determineBuffTargets: (G, player, index) => _dBT(G, player, index),
  // determineHealTargets: (G, player, index) => _dHT(G, player, index),
  // determineSpellTargets: (G, player) => _dST(G, player),
  // determineWarcryTargets: (G, player) => _dWT(G, player),

  // // canAttack
  // disableCanAttack: (G, player, index) => _dMCA(G, player, index),
  // disableAllCanAttack: (G, player) => _dAMCA(G, player),
  // enableCanAttack: (G, player, index) => _eMCA(G, player, index),
  // enableAllCanAttack: (G, player) => _eAMCA(G, player),
  
  // can be attacked
  disableCanBeAttacked: (G, player, index) => {
    if (!G.boards[player][index]) return;
    G.boards[player][index].canBeAttackedByMinion = false;
    G.boards[player][index].canBeAttackedByPlayer = false;
    G.boards[player][index].canBeAttackedBySpell = false;
    G.boards[player][index].canBeAttackedByOnPlay = false;
  },
  // disableAllCanBeAttacked: (G, player) => _dAMCBA(G, player),
  // enableCanBeAttacked: (G, player, index) => _eMCBA(G, player, index),
  // enableAllCanBeAttacked: (G, player) => _eAMCBA(G, player),
  
  // // canBeBuffed
  // disableCanBeBuffed: (G, player, index) => _dMCBB(G, player, index),
  // disableAllCanBeBuffed: (G, player) => _dAMCBB(G, player),
  // enableCanBeBuffed: (G, player, index) => _eMCBB(G, player, index),
  // enableAllCanBeBuffed: (G, player) => _eAMCBB(G, player),

  // // canBeHealed
  // disableCanBeHealed: (G, player, index) => _dMCBH(G, player, index),
  // disableAllCanBeHealed: (G, player) => _dAMCBH(G, player),
  // enableCanBeHealed: (G, player, index) => _eMCBH(G, player, index),
  // enableAllCanBeHealed: (G, player) => _eAMCBH(G, player),

  // // kill minion methods
  // killMinion: (G, ctx, player, boardSlot, index) => _kM(G, ctx, player, boardSlot, index),
  // killMinionIfHealthIsZero: (G, ctx, player, boardSlot, index) => _kM0(G, ctx, player, boardSlot, index),

  // // card placement
  // placeCardOnBoard: (G, player, boardSlotObject, index) => _pC(G, player, boardSlotObject, index),
};

export default boards;
