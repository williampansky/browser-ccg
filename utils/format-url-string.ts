/**
 * Removes hhtp(?s)://www. from URL string.
 * @see https://stackoverflow.com/a/41942787/8296677
 */
export default function formatUrlString(string: string) {
  if (!string) return;
  return string.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '');
}
