/**
 * Parses rich text string and returns formatted html.
 * @param {string} markup Rich text string to parse
 * @requires dangerouslySetInnerHTML
 * @see https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml
 */
export default function createMarkup(markup?: string) {
  if (!markup || typeof markup === undefined) return { __html: '' };
  return { __html: markup };
}
