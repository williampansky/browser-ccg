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
  // const {
  //   artistName,
  //   artistUrl,
  //   collectible,
  //   cost,
  //   description,
  //   elite,
  //   entourage,
  //   id,
  //   isEntourage,
  //   mechanics,
  //   name,
  //   numberPrimary,
  //   numberRNG,
  //   numberSecondary,
  //   power,
  //   race,
  //   rarity,
  //   set,
  //   text,
  //   type,
  // } = obj;

  const SET = obj?.set?.replace(/\%/g, '');
  const RARITY = obj?.rarity?.replace(/\%/g, '').replace('RARITY_', '');
  const RACE = obj?.race?.replace(/\%/g, '').replace('RACE_', '');
  const TYPE = obj?.type?.replace(/\%/g, '').replace('TYPE_', '');

  return {
    artist:
      obj?.artistName || obj?.artistUrl
        ? createArtistHtmlLink(obj?.artistName, obj?.artistUrl)
        : undefined,
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
    id: obj?.id,
    imageFlairSrc: `/images/sets/${SET}/${obj?.id}`,
    isEntourage: obj?.isEntourage || false,
    key: obj?.id,
    mechanics: obj?.mechanics,
    name: obj?.name,
    numberPrimary: obj?.numberPrimary,
    numberRNG: obj?.numberRNG,
    numberSecondary: obj?.numberSecondary,
    powerStream: [],
    race: RACE,
    rarity: RARITY,
    revealed: false,
    revealedOnTurn: 0,
    set: SET,
    text: obj?.text ? createMarkup(replaceAllConstants(obj?.text)) : undefined,
    type: TYPE,
    uuid: uuid(),
    value: obj?.name,
    zonePowerAdjustment: 0,
  };
};

export default createCardObject;
