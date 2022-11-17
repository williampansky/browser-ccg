import replaceAllConstants from './replace-all-constants';

/**
 * Constructs a string based on params that
 * points to the relativve flair image.
 */
const getImageFlairSrc = (
  id?: string,
  set?: string,
  key: string = 'CARD'
): string => {
  return set && id
    ? `/images/sets/${replaceAllConstants(set, 'value')}/${id}-${key}.jpg`
    : '/images/sets/PLACEHOLDER.jpg';
};

export default getImageFlairSrc;
