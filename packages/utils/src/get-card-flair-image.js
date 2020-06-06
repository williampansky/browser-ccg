import { removeSymbols } from '@ccg/utils';

function getImageObject(cardId, cardSet, images = {}, isGold = false) {
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

export default function getCardFlairImage(cardId, cardSet, images, isGold) {
  try {
    const imgObj = getImageObject(cardId, cardSet, images, isGold);
    const { value } = imgObj;
    return value;
  } catch (error) {
    return console.error(error);
  }
}
