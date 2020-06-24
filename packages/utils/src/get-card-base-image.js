import { replaceConstant } from '@ccg/utils';
import { CARDS } from '@ccg/images';
import { TYPE } from '@ccg/enums';

function getImageObject(cardRarity, cardType, isGold = false, images = CARDS) {
  const rarity = replaceConstant(cardRarity).toUpperCase();

  const srcString =
    cardType === TYPE['ITEM'] || cardType === TYPE['SPELL']
      ? `front/${rarity}-ALT.png`
      : `front/${rarity}.png`;

  const imgMatch = Object.entries(images)
    .map(([key, value]) => {
      return {
        key,
        value
      };
    })
    .filter(obj => obj.key === srcString)
    .pop();

  return imgMatch;
}

export default function getCardBaseImage(cardRarity, cardType, isGold) {
  try {
    const imgObj = getImageObject(cardRarity, cardType, isGold);
    const { value } = imgObj;
    return value;
  } catch (error) {
    return;
    // return console.error(error);
  }
}
