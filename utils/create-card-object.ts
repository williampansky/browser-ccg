import { isArray } from 'mathjs';
import { v4 as uuid } from 'uuid';
import { Card, CardBase } from '../types';
import createArtistHtmlLink from './create-artist-html-link';
import createMarkup from './create-markup';
import replaceAllConstants from './replace-all-constants';

/**
 * Creates a playable `Card` object from the provided card base info.
 */
const createCardObject = (obj: CardBase): Card => {
  const {
    artistName,
    artistUrl,
    collectible,
    cost,
    description,
    elite,
    entourage,
    id,
    isEntourage,
    mechanics,
    name,
    numberPrimary,
    numberRNG,
    numberSecondary,
    power,
    race,
    rarity,
    set,
    text,
    type,
  } = obj;

  const SET = set?.replace(/\%/g, '');
  const RARITY = rarity?.replace(/\%/g, '').replace('RARITY_', '');
  const RACE = race?.replace(/\%/g, '').replace('RACE_', '');
  const TYPE = type?.replace(/\%/g, '').replace('TYPE_', '');

  return {
    artist:
      artistName || artistUrl
        ? createArtistHtmlLink(artistName, artistUrl)
        : undefined,
    artistName,
    artistUrl,
    baseCost: cost,
    basePower: power,
    canPlay: false,
    collectible: collectible || false,
    currentCost: cost,
    description,
    displayPower: power,
    elite: elite || false,
    // entourage: () => {
    //   if (typeof entourage === 'string') return entourage;
    //   if (isArray(entourage)) entourage?.map((ent: string) => {

    //   })
    // },
    id,
    imageFlairSrc: `/images/sets/${SET}/${id}`,
    isEntourage: isEntourage || false,
    key: id,
    mechanics,
    name,
    numberPrimary,
    numberRNG,
    numberSecondary,
    powerStream: [],
    race: RACE,
    rarity: RARITY,
    revealed: false,
    revealedOnTurn: 0,
    set: SET,
    text: text ? createMarkup(replaceAllConstants(text)) : undefined,
    type: TYPE,
    uuid: uuid(),
    value: name,
    zonePowerAdjustment: 0,
  };
};

export default createCardObject;
