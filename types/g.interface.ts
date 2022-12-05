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

export interface LastCardPlayed {
  card?: Card;
  index?: number;
}

export interface LastMoveMade {
  args: any[],
  playerID: PlayerID,
  type: string;
}

export declare type CardIndex = number | undefined;
export declare type SelectedCardIndex = Record<PlayerID, CardIndex>;

export interface GameState {
  actionPoints: Record<PlayerID, ActionPoints>;
  aiLoading: boolean;
  aiPossibleCards: Card[];
  canUndo: Record<PlayerID, boolean>;
  counts: Record<PlayerID, Counts>;
  firstRevealer: PlayerID;
  gameConfig: GameConfig;
  lastCardPlayed: LastCardPlayed;
  lastMoveMade: string | undefined;
  playedCards: Record<PlayerID, Card[]>;
  playerNames: Record<PlayerID, PlayerName>;
  players: Record<PlayerID, Player>;
  playerTurnDone: Record<PlayerID, boolean>;
  selectedCardData: Record<PlayerID, Card | undefined>;
  selectedCardIndex: SelectedCardIndex;
  turn: number;
  zones: Zone[];
  zonesCardsReference: Record<PlayerID, Card[]>[];
}
