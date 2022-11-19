import db from '../data/mechanics.json';

/**
 * Returns the description of the provided parsed constant.
 */
const getMechanicDescription = (
  key: string,
  json: Record<string, any> = db
): string | undefined => {
  return json[key] && json[key].description ? json[key].description : undefined;
};

export default getMechanicDescription;
