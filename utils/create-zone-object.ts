import { v4 as uuid } from 'uuid';
import { Zone, ZoneBase } from '../types';
import createArtistHtmlLink from './create-artist-html-link';

/**
 * Creates a `Zone` object from the provided zone base info. Can
 * be create with or without a uuid() via the second param.
 */
const createZoneObject = (obj: ZoneBase, withUuid: boolean = false): Zone => {
  const {
    artistName,
    artistUrl,
    effectAdjustment,
    effectText,
    entourage,
    flavorText,
    id,
    mechanics,
    name,
    set,
  } = obj;

  return {
    artist:
      artistName && artistUrl
        ? createArtistHtmlLink(artistName, artistUrl)
        : undefined,
    artistName: artistName,
    artistUrl: artistUrl,
    disabled: {
      '0': false,
      '1': false,
    },
    disabledForXTurns: {
      '0': 0,
      '1': 0,
    },
    effectAdjustment: effectAdjustment,
    effectText: effectText,
    entourage: entourage,
    flavorText: flavorText,
    id: id,
    name: name,
    mechanics: mechanics,
    mechanicsEnabled: obj?.mechanicsEnabled,
    powers: {
      '0': 0,
      '1': 0,
    },
    revealed: false,
    set: set,
    sides: {
      '0': [],
      '1': [],
    },
    uuid: withUuid ? uuid() : '',
  } as Zone;
};

export default createZoneObject;
