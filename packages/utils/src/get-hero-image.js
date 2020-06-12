import { HEROS } from '@ccg/images';
import { removeSymbols } from '@ccg/utils';

function getImageObject(heroName, imageString, images = HEROS) {
  const name = removeSymbols(heroName);
  const srcString = `${name}/${imageString}.jpg`;
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

export default function getHeroImage(heroName, imageString) {
  try {
    const imgObj = getImageObject(heroName, imageString);
    const { value } = imgObj;
    return value;
  } catch (error) {
    return;
    // return console.error(error);
  }
}
