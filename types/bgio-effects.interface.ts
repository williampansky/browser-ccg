import { Card } from './card.interface';
import { PlayerID } from './player.interface';
import { Zone } from './zone.interface';

export interface DiscardEffects {
  cardUuid: string;
  cardIdx: number;
  player: PlayerID;
}

export interface RevealCardEffects {
  card: Card;
  zoneNumber: number;
  slotIndex: number;
  player: PlayerID;
}

export interface RevealZoneEffects {
  zone: Zone;
  zoneNumber: number;
}
