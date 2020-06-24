import { removeSymbols } from '@ccg/utils';
import { SETS } from '@ccg/images';

function getImageObject(cardId, cardSet, isGold = false, images = SETS) {
  const id = removeSymbols(cardId);
  const set = removeSymbols(cardSet);
  const srcString = `${set}/${id}-CARD.jpg`;
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

export default function getCardFlairImage(cardId, cardSet, isGold) {
  try {
    const imgObj = getImageObject(cardId, cardSet, isGold);
    const { value } = imgObj;
    return value;
  } catch (error) {
    return;
    // return console.error(error);
  }
}
