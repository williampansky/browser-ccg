import replaceConstant from '../replace-constants';

test(`Should return a string with its constants formatted.`, () => {
  const string = `%TYPE_MINION%`;
  const result = replaceConstant(string);
  expect(result).toEqual('Minion');
});
