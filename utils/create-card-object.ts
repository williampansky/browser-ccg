import { v4 as uuid } from 'uuid';
import { Card, CardBase } from '../types';
import createArtistHtmlLink from './create-artist-html-link';
import createCardKey from './create-card-key';
import createMarkup from './create-markup';
import getImageFlairSrc from './get-image-flair-src';
import replaceAllConstants from './replace-all-constants';

/**
 * Creates a playable `Card` object from the provided card base info.
 */
const createCardObject = (obj: CardBase): Card => {
  return {
    id: obj?.id,
    set: replaceAllConstants(obj?.set),
    artist: createArtistHtmlLink(obj?.artistName, obj?.artistUrl),
    artistName: obj?.artistName,
    artistUrl: obj?.artistUrl,
    baseCost: obj?.cost,
    basePower: obj?.power,
    canPlay: false,
    collectible: obj?.collectible || false,
    currentCost: obj?.cost,
    description: obj?.description,
    displayPower: obj?.power,
    elite: obj?.elite || false,
    entourage: obj?.entourage,
    flavorText: obj?.flavorText
      ? replaceAllConstants(obj?.flavorText)
      : undefined,
    imageFlairSrc: getImageFlairSrc(obj?.id, obj?.set),
    isEntourage: obj?.isEntourage || false,
    key: createCardKey(obj?.id, obj?.set),
    mechanics: obj?.mechanics,
    name: obj?.name,
    numberPrimary: obj?.numberPrimary,
    numberRNG: obj?.numberRNG,
    numberSecondary: obj?.numberSecondary,
    powerStream: [],
    race: replaceAllConstants(obj?.race, 'value'),
    rarity: replaceAllConstants(obj?.rarity, 'value'),
    revealed: false,
    revealedOnTurn: 0,
    text: obj?.text ? createMarkup(replaceAllConstants(obj?.text)) : undefined,
    type: replaceAllConstants(obj?.type, 'value'),
    uuid: uuid(),
    value: obj?.name,
    zonePowerAdjustment: 0,
  };
};

export default createCardObject;
