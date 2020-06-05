import formatUrlString from '../format-url-string';

test(`Should return a shortned URL string.`, () => {
  const string = `https://www.google.com`;
  const result = formatUrlString(string);
  expect(result).toEqual('google.com');
});
