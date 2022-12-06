import { GameState, PlayerID } from '../types';
import { actionPoints } from '../game/state';

export default function determineActionPoints(G: GameState, player: PlayerID) {
  actionPoints.incrementTotal(G, player);
  actionPoints.matchTotal(G, player);
}
