import type { PlayerID as BoardgamePlayerID } from 'boardgame.io';
import type { Account } from './account.interface';
import type { Card, CardId } from './card.interface';

/**
 * A string representing one of the two game players.
 */
export declare type PlayerID = '0' | '1' | BoardgamePlayerID;

export declare type PlayerName = string;

export interface ActionPoints {
  current: number;
  total: number;
}

export interface PlayerCards {
  deck: Card[];
  destroyed: Card[];
  discarded: Card[];
  hand: Card[];
  played: CardId[];
}

export interface Player {
  _account?: Account;
  actionPoints: ActionPoints;
  cards: PlayerCards;
  displayName: PlayerName;
  playerId: PlayerID;
}
