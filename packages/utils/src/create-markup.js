/**
 * Parses rich text string and returns formatted html.
 * @param {String} string Rich text string to parse
 * @requires dangerouslySetInnerHTML
 * @see https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml
 */
export default function createMarkup(markup) {
  return { __html: markup };
}
