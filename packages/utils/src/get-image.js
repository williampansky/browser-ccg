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

const getImage = (key, images) => {
  try {
    const imgObj = getImageObject(key, images);
    const { value } = imgObj;
    return value;
  } catch (error) {
    return;
    // return console.error(error);
  }
};

export default getImage;
