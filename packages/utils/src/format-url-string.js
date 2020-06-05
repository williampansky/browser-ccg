import { exists } from '@ccg/utils';

/**
 * Removes hhtp(?s)://www. from URL string.
 * @param {String} string e.g. https://www.artstation.com/dianafranco
 * @see https://stackoverflow.com/a/41942787/8296677
 */
export default function formatUrlString(string) {
  if (!exists(string)) return;
  return string.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '');
}
