import { ICONS } from '@ccg/images';

function getImageObject(fileName, images = ICONS) {
  const srcString = `${fileName}.svg`;
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

export default function getIcon(fileName) {
  try {
    const imgObj = getImageObject(fileName);
    const { value } = imgObj;
    return value;
  } catch (error) {
    return;
    // return console.error(error);
  }
}
