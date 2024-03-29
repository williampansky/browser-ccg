import { v4 as uuid } from 'uuid';
import { Mechanics } from '../enums';
import { Card, CardBase } from '../types';
import createArtistHtmlLink from './create-artist-html-link';
import createCardKey from './create-card-key';
import formatCardText from './format-card-text';
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
    baseHealth: obj?.health,
    basePower: obj?.power,
    // prettier-ignore
    booleans: {
      canBeAttackedBySpell: false,
      canBeAttackedByWeapon: false,
      canBeBuffed: false,
      canBeDebuffed: false,
      canBeDestroyed: false,
      canBeHealed: false,
      eventWasTriggered: false,
      hasArmor: obj?.mechanics?.find(v => v === Mechanics.Armor) ? true : false,
      hasCostIncreased: false,
      hasCostReduced: false,
      hasHealthIncreased: false,
      hasHealthReduced: false,
      hasPowerIncreased: false,
      hasPowerReduced: false,
      hasEvent: obj?.mechanics?.find(v => v === Mechanics.Event) ? true : false,
      hasImmunity: obj?.mechanics?.find(v => v === Mechanics.Immune) ? true : false,
      hasOnTurnEnd: obj?.mechanics?.find(v => v === Mechanics.OnTurnEnd) ? true : false,
      hasOnTurnStart: obj?.mechanics?.find(v => v === Mechanics.OnTurnStart) ? true : false,
      isBooned: false,
      isBuffed: false,
      isDamaged: false,
      isDebuffed: false,
      isDestroyed: false,
      isDisabled: false,
      isHidden: obj?.mechanics?.find(v => v === Mechanics.Hidden) ? true : false,
      isSilenced: false,
      onPlayWasTriggered: false,
      wasDiscarded: false,
      wasDiscovered: false,
      wasHealed: false,
      wasResurrected: false,
      wasReturned: false,
      wasTransferred: false,
      wasTransformed: false,
      willBeDestroyedNextTurn: false,
    },
    canPlay: false,
    collectible: obj?.collectible || false,
    currentCost: obj?.cost,
    description: obj?.description,
    displayHealth: obj?.health,
    displayPower: obj?.power,
    elite: obj?.elite || false,
    entourage: obj?.entourage,
    eventStream: [],
    flavorText: obj?.flavorText
      ? replaceAllConstants(obj?.flavorText)
      : undefined,
    fpoArt: obj?.fpoArt || false,
    healthStream: [],
    imageFlairSrc: getImageFlairSrc(obj?.id, obj?.set),
    isEntourage: obj?.isEntourage || false,
    key: createCardKey(obj?.id, obj?.set),
    mechanics: obj?.mechanicsEnabled ? obj?.mechanics : [],
    mechanicsEnabled: obj?.mechanicsEnabled || false,
    mechanicsSide: obj?.mechanicsSide,
    name: obj?.name,
    numberPrimary: obj?.numberPrimary,
    numberRNG: obj?.numberRNG,
    numberSecondary: obj?.numberSecondary,
    mechanicsContext: replaceAllConstants(obj?.mechanicsContext, 'value'),
    playType: replaceAllConstants(obj?.playType, 'value'),
    powerStream: [],
    race: replaceAllConstants(obj?.race, 'value'),
    rarity: replaceAllConstants(obj?.rarity, 'value'),
    refId: obj?.refId,
    revealed: false,
    revealedOnTurn: 0,
    targetingText: obj?.targetingText
      ? formatCardText(obj?.targetingText)
      : undefined,
    text: obj?.text && obj?.mechanicsEnabled ? obj.text : undefined,
    type: replaceAllConstants(obj?.type, 'value'),
    uuid: uuid(),
    value: obj?.name,
    zonePowerAdjustment: 0,
    zoneCostAdjustment: 0,
  };
};

export default createCardObject;
