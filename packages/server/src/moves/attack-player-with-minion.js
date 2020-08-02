import boards from '../state/boards';
import playerCanBeAttacked from '../state/player-can-be-attacked';
import playerCanBeHealed from '../state/player-can-be-healed';
import playerHealth from '../state/player-health';
import playerShieldPoints from '../state/player-shield-points';
import deselectMinion from './deselect-minion';
import logMessage from '../match-history/log-message';

/**
 * Attacks a player with the current player's selectedMinionObject.
 * @param {object} G
 * @param {object} ctx
 * @param {number} index
 */
const attackPlayerWithMinion = (G, ctx) => {
  const { selectedMinionIndex, selectedMinionObject, turnOrder } = G;
  const { currentPlayer } = ctx;
  const otherPlayer = turnOrder.find(p => p !== currentPlayer);

  const PLAYER_BEING_ATTACKED = otherPlayer;
  const ATTACKING_MINION = selectedMinionObject[currentPlayer];
  const ATTACKING_MINION_INDEX = selectedMinionIndex[currentPlayer];

  if (!ATTACKING_MINION) return;

  const ATTACKING_MINION_HAS_DBLATK = ATTACKING_MINION.hasDoubleAttack;
  const ATTACKING_MINION_DBLATK_COUNT = ATTACKING_MINION.hasDoubleAttackCount;

  // eject if ATTACKING_MINION can't attack
  if (ATTACKING_MINION && !ATTACKING_MINION.canAttack) return;

  // eject if a PLAYER_BEING_ATTACKED's minion has gaurd
  for (let i = 0; i < G.boards[otherPlayer].length; i++) {
    if (G.boards[otherPlayer][i] && G.boards[otherPlayer][i].hasBulwark) return;
  }

  logMessage(G, ctx, 'attackPlayer');

  // set attacked minion index for animation
  G.boards[currentPlayer][ATTACKING_MINION_INDEX].isAttackingPlayer = true;

  // remove shieldPoints first, then health
  if (G.playerShieldPoints[otherPlayer] !== 0) {
    const preDIFF = Math.abs(
      G.playerShieldPoints[otherPlayer] - ATTACKING_MINION.currentAttack
    );

    playerShieldPoints.remove(G, otherPlayer, ATTACKING_MINION.currentAttack);
    if (G.playerShieldPoints[otherPlayer] === 0)
      playerHealth.subtract(G, PLAYER_BEING_ATTACKED, preDIFF);
  } else {
    // Subtract `ATTACKING_MINION.currentAttack`
    // from PLAYER_BEING_ATTACKED's health value
    playerHealth.subtract(
      G,
      PLAYER_BEING_ATTACKED,
      ATTACKING_MINION.currentAttack
    );
  }

  // handle onslaught mechanic
  if (ATTACKING_MINION_HAS_DBLATK === true) {
    // deincrement hasDoubleAttackCount integer
    G.boards[currentPlayer][
      ATTACKING_MINION_INDEX
    ].hasDoubleAttackCount = Math.abs(
      G.boards[currentPlayer][ATTACKING_MINION_INDEX].hasDoubleAttackCount - 1
    );

    if (ATTACKING_MINION_DBLATK_COUNT === 0) {
      boards.disableCanAttack(G, currentPlayer, ATTACKING_MINION_INDEX);
      G.boards[currentPlayer][ATTACKING_MINION_INDEX].hasAttacked = true;
    }
  } else {
    // disable ATTACKING_MINION's ability to attack
    boards.disableCanAttack(G, currentPlayer, ATTACKING_MINION_INDEX);
    G.boards[currentPlayer][ATTACKING_MINION_INDEX].hasAttacked = true;
  }

  // remove concealed once you attack
  G.boards[currentPlayer][ATTACKING_MINION_INDEX].isHidden = false;

  // reset currentPlayer's selectedMinionIndex & selectedMinionObject value
  deselectMinion(G, ctx);

  // then disable opponent minions can be attacked
  boards.disableAllCanBeAttacked(G, otherPlayer);

  // disable all player can be attacked
  playerCanBeAttacked.disable(G, '0');
  playerCanBeAttacked.disable(G, '1');

  // disable all playerCanBeHealed
  playerCanBeHealed.disable(G, '0');
  playerCanBeHealed.disable(G, '1');
};

export default attackPlayerWithMinion;
