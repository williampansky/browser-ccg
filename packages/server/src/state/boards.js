import { _aTMH, _sFMH } from './boards.minion-health';
import { _dAMT, _dBT, _dHT, _dOPT, _dST } from './boards.determinations';
import { _dE, _dAE } from './boards.disable-everything';
import { _dMCA, _dAMCA, _eMCA, _eAMCA } from './boards.can-attack';
import { _dMCBA, _dAMCBA, _eMCBA, _eAMCBA } from './boards.can-be-attacked';
import { _dMCBB, _dAMCBB, _eMCBB, _eAMCBB } from './boards.can-be-buffed';
import { _dMCBDb, _dAMCBDb, _eMCBDb, _eAMCBDb } from './boards.can-be-debuffed';
import { _dMCBH, _dAMCBH, _eMCBH, _eAMCBH } from './boards.can-be-healed';
import { _kM, _kM0 } from './boards.kill-minion';
import { _pC } from './boards.place-minion-on-board';
import createBoardSlotObject from '../creators/create-board-slot-object';

const boardConfig = {
  enableDebugSlots: true,
  player0DebugSlots: [
    { ...createBoardSlotObject('CORE_052'), hasBulwark: true },
    { ...createBoardSlotObject('CORE_038'), currentHealth: 5 }
  ],
  player1DebugSlots: [
    { ...createBoardSlotObject('CORE_122') },
    { ...createBoardSlotObject('CORE_108'), hasBoon: true },
    { ...createBoardSlotObject('CORE_042') }
  ]
};

// prettier-ignore
const boards = {
  __DATA_MODEL: {
    '0': boardConfig.enableDebugSlots ? boardConfig.player0DebugSlots : [],
    '1': boardConfig.enableDebugSlots ? boardConfig.player1DebugSlots : []
  },

  // minion health
  addToMinionHealth: (G, player, index, amount) => _aTMH(G, player, index, amount),
  subtractFromMinionHealth: (G, player, index, amount) => _sFMH(G, player, index, amount),

  // target determination
  determineAttackTargets: (G, player) => _dAMT(G, player),
  determineBuffTargets: (G, player, index) => _dBT(G, player, index),
  determineHealTargets: (G, player, index) => _dHT(G, player, index),
  determineOnPlayTargets: (G, player) => _dOPT(G, player),
  determineSpellTargets: (G, player) => _dST(G, player),

  // disable everything
  disableEverything: (G, player, index) => _dE(G, player, index),
  disableAllEverything: (G, player) => _dAE(G, player),

  // canAttack
  disableCanAttack: (G, player, index) => _dMCA(G, player, index),
  disableAllCanAttack: (G, player) => _dAMCA(G, player),
  enableCanAttack: (G, player, index) => _eMCA(G, player, index),
  enableAllCanAttack: (G, player) => _eAMCA(G, player),
  
  // can be attacked
  disableCanBeAttacked: (G, player, index) => _dMCBA(G, player, index),
  disableAllCanBeAttacked: (G, player) => _dAMCBA(G, player),
  enableCanBeAttacked: (G, player, index) => _eMCBA(G, player, index),
  enableAllCanBeAttacked: (G, player) => _eAMCBA(G, player),
  
  // canBeBuffed
  disableCanBeBuffed: (G, player, index) => _dMCBB(G, player, index),
  disableAllCanBeBuffed: (G, player) => _dAMCBB(G, player),
  enableCanBeBuffed: (G, player, index) => _eMCBB(G, player, index),
  enableAllCanBeBuffed: (G, player) => _eAMCBB(G, player),
  
  // canBeDebuffed
  disableCanBeDebuffed: (G, player, index) => _dMCBDb(G, player, index),
  disableAllCanBeDebuffed: (G, player) => _dAMCBDb(G, player),
  enableCanBeDebuffed: (G, player, index) => _eMCBDb(G, player, index),
  enableAllCanBeDebuffed: (G, player) => _eAMCBDb(G, player),

  // canBeHealed
  disableCanBeHealed: (G, player, index) => _dMCBH(G, player, index),
  disableAllCanBeHealed: (G, player) => _dAMCBH(G, player),
  enableCanBeHealed: (G, player, index) => _eMCBH(G, player, index),
  enableAllCanBeHealed: (G, player) => _eAMCBH(G, player),

  // kill minion methods
  killMinion: (G, ctx, player, boardSlot, index) => _kM(G, ctx, player, boardSlot, index),
  killMinionIfHealthIsZero: (G, ctx, player, boardSlot, index) => _kM0(G, ctx, player, boardSlot, index),

  // card placement
  placeCardOnBoard: (G, ctx, player, boardSlotObject, index = 0) => {
    return _pC(G, ctx, player, boardSlotObject, index);
  },
};

export default boards;
