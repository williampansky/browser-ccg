import { MECHANICS } from '@ccg/images';

function getImageObject(key, images = MECHANICS) {
  const imgMatch = Object.entries(images)
    .map(([key, value]) => {
      return {
        key,
        value
      };
    })
    .filter(obj => obj.key === key)
    .pop();

  return imgMatch;
}

export default function getMechanicImage(fileName) {
  try {
    const imgObj = getImageObject(fileName);
    const { value } = imgObj;
    return value;
  } catch (error) {
    return;
    // return console.error(error);
  }
}
