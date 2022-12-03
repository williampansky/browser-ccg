import { GameState, PlayerID } from '../../../../../types';

interface Props {
  G: GameState;
  player: PlayerID;
}

export const unsetPlayableCards = ({ G, player }: Props) => {
  G.players[player].cards.hand.forEach((c) => {
    c.canPlay = false;
  });
};
