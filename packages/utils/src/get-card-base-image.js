import { TYPE } from '@ccg/enums';
import { replaceConstant } from '@ccg/utils';

function getImageObject(cardRarity, cardType, images = {}, isGold = false) {
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

export default function getCardBaseImage(cardRarity, cardType, images, isGold) {
  try {
    const imgObj = getImageObject(cardRarity, cardType, images, isGold);
    const { value } = imgObj;
    return value;
  } catch (error) {
    return console.error(error);
  }
}
