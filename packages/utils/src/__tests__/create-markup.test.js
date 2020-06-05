import createMarkup from '../create-markup';

test(`Should return an object with an __html key and string.`, () => {
  const string = `<strong>%BULWARK%</strong>`;
  const result = createMarkup(string);
  expect(result).toEqual({ __html: '<strong>%BULWARK%</strong>' });
});
