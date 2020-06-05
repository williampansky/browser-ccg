import formatCardText from '../format-card-text';
import replaceConstant from '../replace-constants';

test(`Should return a formatted string.`, () => {
  const string = `%TRANSFORM% a minion into a 0/1 %RACE_DEMON% with %BULWARK%`;
  const TRANSFORM = replaceConstant('%TRANSFORM%');
  const RACE = replaceConstant('%RACE_DEMON%');
  const BULWARK = replaceConstant('%BULWARK%');

  const result = formatCardText(string);
  expect(result).toEqual(
    `${TRANSFORM} a minion into a 0/1 ${RACE} with ${BULWARK}`
  );
});
