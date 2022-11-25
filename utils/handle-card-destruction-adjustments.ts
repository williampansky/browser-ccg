import { Mechanics } from '../enums';
import { Card, GameState, PlayerID } from '../types';
import removeBoonFromCards from './remove-boon-from-cards';

/**
 * Checks the targetCard's mechanics and handles
 * the required adjustments if the card was destroyed.
 */
const handleCardDestructionMechanics = (
  G: GameState,
  targetCard: Card,
  targetPlayer: PlayerID,
): void => {
  if (targetCard.mechanics?.find((m) => m === Mechanics.Boon)) {
    removeBoonFromCards(G, targetCard, targetPlayer);
  }
};

export default handleCardDestructionMechanics;
