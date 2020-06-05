import removeSymbols from '../remove-symbols';

test(`Should return a string without symbols.`, () => {
  const string = `%TYPE_MINION%`;
  const result = removeSymbols(string);
  expect(result).toEqual('TYPE_MINION');
});
