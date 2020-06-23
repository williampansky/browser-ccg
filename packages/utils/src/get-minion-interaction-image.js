import { INTERACTIONS } from '@ccg/images';

function getImageObject(fileName, images = INTERACTIONS) {
  const imgMatch = Object.entries(images)
    .map(([key, value]) => {
      return {
        key,
        value
      };
    })
    .filter(obj => obj.key === fileName)
    .pop();

  return imgMatch;
}

export default function getMinionInteractionImage(fileName) {
  try {
    const imgObj = getImageObject(fileName);
    const { value } = imgObj;
    return value;
  } catch (error) {
    return;
    // return console.error(error);
  }
}
