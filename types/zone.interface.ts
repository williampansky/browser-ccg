import type { Card } from './card.interface';
import type { PlayerID } from './player.interface';

/**
 * Base zone information from the database/API, which gets
 * converted into a Zone interface via the `createZoneObject` util.
 * @see createZoneObject
 */
export interface ZoneBase {
  id: string;
  name: string;
  effectText?: string;
  effectAdjustment?: number;
}

export declare type Zones = Zone[];
export declare type ZonesCardsReference = Record<PlayerID, Card[]>;

export interface Zone {
  disabled: Record<PlayerID, boolean>;
  effectAdjustment: number;
  effectText?: string;
  id: string;
  name: string;
  powers: Record<PlayerID, number>;
  revealed: boolean;
  sides: Record<PlayerID, Card[]>;
  uuid: string;
}
