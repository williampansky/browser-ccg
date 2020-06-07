function getImageObject(key, images = {}) {
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

export default function getMechanicIconImage(cardId, cardSet, images) {
  try {
    const imgObj = getImageObject(cardId, cardSet, images);
    const { value } = imgObj;
    return value;
  } catch (error) {
    return console.error(error);
  }
}
