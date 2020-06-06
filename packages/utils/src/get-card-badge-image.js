function getImageObject(primaryKey, isElite, images = {}) {
  let prefix;

  switch (primaryKey) {
    case 'attack badge':
      prefix = isElite ? 'BADGE_SWORD-ALT' : 'BADGE_SWORD';
      break;

    case 'health badge':
      prefix = isElite ? 'BADGE_SHIELD-ALT' : 'BADGE_SHIELD';
      break;

    default:
      break;
  }

  const srcString = `${prefix}.png`;
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

export default function getCardBadgeImage(primaryKey, isElite, images) {
  try {
    const imgObj = getImageObject(primaryKey, isElite, images);
    const { value } = imgObj;
    return value;
  } catch (error) {
    return console.error(error);
  }
}
