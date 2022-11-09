import type { GameConfig } from './app-config.interface';
import type { Card } from './card.interface';
import type { ActionPoints, PlayerID, PlayerName } from './player.interface';
import type {Player} from './player.interface';
import type {Zone} from './zone.interface';

export interface Counts {
  deck: number;
  hand: number;
  discarded: number;
  destroyed: number;
  played: number;
}

export interface GameOver {
  draw?: boolean;
  winner?: PlayerID;
}

export declare type CardIndex = number | undefined;
export declare type SelectedCardIndex = Record<PlayerID, CardIndex>;

export interface GameState {
  actionPoints: Record<PlayerID, ActionPoints>;
  gameConfig: GameConfig;
  counts: Record<PlayerID, Counts>;
  firstRevealer: PlayerID;
  playedCards: Record<PlayerID, Card[]>;
  players: Record<PlayerID, Player>;
  playerNames: Record<PlayerID, PlayerName>;
  playerTurnDone: Record<PlayerID, boolean>;
  selectedCardData: Record<PlayerID, Card | undefined>;
  selectedCardIndex: SelectedCardIndex;
  turn: number;
  zones: Zone[];
  zonesCardsReference: Record<PlayerID, Card[]>[];
}
