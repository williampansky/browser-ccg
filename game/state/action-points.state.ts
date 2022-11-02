import { add, subtract } from 'mathjs';
import { ActionPoints, GameState, PlayerID } from '../../types';
import limitNumberWithinRange from '../../utils/limit-number-within-range';

const actionPoints = {
  defaultState: {
    '0': { current: 0, total: 0 },
    '1': { current: 0, total: 0 },
  } as Record<PlayerID, ActionPoints>,

  /**
   * Increments the `total` G.ActionPoints of the player by one;
   * unless the total is already at the max per config allotment.
   *
   * @param {object} G Game state object
   * @param {string} player Player to increment
   * @requires mathjs::add()
   */
  incrementTotal: (G: GameState, player: PlayerID) => {
    const { actionPoints, gameConfig } = G;
    const { total } = actionPoints[player];

    if (total === gameConfig.numerics.actionPointsTotal) return;

    const newTotal = add(Number(total), 1);
    G.actionPoints[player].total = newTotal;
  },

  /**
   * Sets the `current` value to the player's `total` value.
   *
   * @param {object} G Game state object.
   * @param {string} player Player to match.
   */
  matchTotal: (G: GameState, player: PlayerID) => {
    const { actionPoints } = G;
    const { total } = actionPoints[player];
    G.actionPoints[player].current = total;
  },

  /**
   * Sets the `current` actionPoints value of the
   * `player` param to the specified `amount`.
   *
   * @param {object} G Game state object.
   * @param {string} player Player to set.
   * @param {number} amount Value to set.
   */
  setCurrent: (G: GameState, player: PlayerID, amount: number) => {
    G.actionPoints[player].current = amount;
  },

  /**
   * Sets the `total` actionPoints value of the
   * `player` param to the specified `amount`.
   *
   * @param {object} G Game state object.
   * @param {string} player Player to set.
   * @param {number} amount Value to set.
   */
  setTotal: (G: GameState, player: PlayerID, amount: number) => {
    G.actionPoints[player].total = amount;
  },

  /**
   * Subtracts amount from player's current actionPoints value.
   *
   * @param {object} G Game state object.
   * @param {string} player
   * @param {number} amount
   * @requires mathjs::subtract()
   * @requires utils::limitNumberWithinRange()
   */
  subtract: (G: GameState, player: PlayerID, amount: number) => {
    const { current, total } = G.actionPoints[player];

    const calculation = subtract(Number(current), Number(amount));
    const newValue = limitNumberWithinRange(calculation, total, 0);

    G.actionPoints[player].current = newValue;
  },
};

export default actionPoints;
