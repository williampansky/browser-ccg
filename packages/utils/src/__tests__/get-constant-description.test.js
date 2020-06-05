import getConstantDescription from '../get-constant-description';
import replaceConstant from '../replace-constants';

test(`Should return the relative constant description.`, () => {
  const string = `%TYPE_MINION%`;
  const SUMMON = replaceConstant('%SUMMON%');

  const result = getConstantDescription(string);
  expect(result).toEqual(
    `A card that, when played, ${SUMMON}s a minion to your board.`
  );
});
