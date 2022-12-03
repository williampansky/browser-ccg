import { GameState, PlayerID } from '../../../../../types';

interface Props {
  G: GameState;
  player: PlayerID;
}

export const determinePlayableCards = ({ G, player }: Props) => {
  const { actionPoints, players } = G;
  const playerHand = players[player].cards.hand;
  const currentAP = actionPoints[player].current;

  playerHand.forEach((c) => {
    if (currentAP >= c.currentCost) c.canPlay = true;
  });
};
