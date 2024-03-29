import type { Card } from './card.interface';
import type { PlayerID } from './player.interface';

export declare type Zones = Zone[];
export declare type ZonesCardsReference = Record<PlayerID, Card[]>;

/**
 * Base zone information from the database/API, which gets
 * converted into a Zone interface via the `createZoneObject` util.
 * @see createZoneObject
 */
export interface ZoneBase {
  artistName?: string;
  artistUrl?: string;
  effectAdjustment?: number;
  effectText?: string;
  entourage?: string[];
  flavorText?: string;
  id: string;
  name: string;
  mechanics?: string[];
  mechanicsEnabled?: boolean;
  set?: string;
}

export interface Zone {
  artist?: string;
  artistName?: string;
  artistUrl?: string;
  disabled: Record<PlayerID, boolean>;
  disabledForXTurns: Record<PlayerID, number>;
  effectAdjustment: number;
  effectText?: string;
  entourage: string[];
  flavorText?: string;
  id: string;
  name: string;
  mechanics?: string[];
  mechanicsEnabled?: boolean;
  powers: Record<PlayerID, number>;
  revealed: boolean;
  set: string;
  sides: Record<PlayerID, Card[]>;
  uuid: string;
}
