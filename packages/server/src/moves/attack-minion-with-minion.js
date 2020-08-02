import boards from '../state/boards';
import deselectMinion from '../moves/deselect-minion';
import handleBoons from '../boons/handle-boons';
import logMessage from '../match-history/log-message';

/**
 * Attacks a minion (index) with the current player's selectedMinionObject.
 * @param {object} G
 * @param {object} ctx
 * @param {number} index
 */
const attackMinionWithMinion = (G, ctx, index) => {
  const { selectedMinionIndex, selectedMinionObject, turnOrder } = G;
  const { currentPlayer } = ctx;
  const otherPlayer = turnOrder.find(p => p !== currentPlayer);

  const ATTACKING_MINION = selectedMinionObject[currentPlayer];
  const ATTACKING_MINION_INDEX = selectedMinionIndex[currentPlayer];

  if (!ATTACKING_MINION) return;

  // eject if ATTACKING_MINION can't attack
  if (ATTACKING_MINION && !ATTACKING_MINION.canAttack) return;
  const ATTACKING_MINION_HAS_DBLATK = ATTACKING_MINION.hasDoubleAttack;
  const ATTACKING_MINION_DBLATK_COUNT = ATTACKING_MINION.hasDoubleAttackCount;

  const MINION_BEING_ATTACKED = G.boards[otherPlayer][index];
  const MINION_BEING_ATTACKED_INDEX = index;

  // eject if MINION_BEING_ATTACKED can't be attacked
  if (MINION_BEING_ATTACKED && !MINION_BEING_ATTACKED.canBeAttackedByMinion)
    return;

  logMessage(G, ctx, 'attackMinion', null, MINION_BEING_ATTACKED_INDEX);

  // set attacked minion index for animation
  G.attackedMinionIndex = MINION_BEING_ATTACKED_INDEX;
  G.boards[currentPlayer][
    ATTACKING_MINION_INDEX
  ].isAttackingMinionIndex = MINION_BEING_ATTACKED_INDEX;

  // if minion has energy shield; remove that first
  if (MINION_BEING_ATTACKED.hasBubble) {
    G.boards[otherPlayer][index].hasBubble = false;
  } else {
    // Subtract `ATTACKING_MINION.currentAttack`
    // from MINION_BEING_ATTACKED_INDEX's currentHealth value
    boards.subtractFromMinionHealth(
      G,
      otherPlayer,
      MINION_BEING_ATTACKED_INDEX,
      ATTACKING_MINION.currentAttack
    );
  }

  // if minion has energy shield; remove that first
  if (ATTACKING_MINION.hasBubble) {
    G.boards[currentPlayer][ATTACKING_MINION_INDEX].hasBubble = false;
  } else {
    // Subtract `MINION_BEING_ATTACKED.currentAttack`
    // from ATTACKING_MINION_INDEX's currentHealth value
    boards.subtractFromMinionHealth(
      G,
      currentPlayer,
      ATTACKING_MINION_INDEX,
      MINION_BEING_ATTACKED.currentAttack
    );
  }

  // handle double attack mechanic
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

  // handle minions that disable target when attacking event mechanic
  if (ATTACKING_MINION.minionData.id === 'CORE_071') {
    G.boards[otherPlayer][index].isDisabled = true;
  }

  // disable MINION_BEING_ATTACKED's ability to be attacked
  boards.disableCanBeAttacked(G, currentPlayer, MINION_BEING_ATTACKED_INDEX);

  // reset currentPlayer's selectedMinionIndex & selectedMinionObject value
  deselectMinion(G, ctx);

  // remove isAttackingMinionIndex prop from attacking minion
  G.boards[currentPlayer][ATTACKING_MINION_INDEX].isAttackingMinionIndex = null;

  // kill ANY minions with health <= 0 and reset states
  boards.killMinionIfHealthIsZero(
    G,
    ctx,
    currentPlayer,
    ATTACKING_MINION,
    ATTACKING_MINION_INDEX
  );
  boards.killMinionIfHealthIsZero(
    G,
    ctx,
    otherPlayer,
    MINION_BEING_ATTACKED,
    MINION_BEING_ATTACKED_INDEX
  );

  // G.attackedMinionIndex = null;
  handleBoons(G, ctx, currentPlayer);
  handleBoons(G, ctx, otherPlayer);
};

export default attackMinionWithMinion;
