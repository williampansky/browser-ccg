import getMechanicShortDescription from '../get-mechanic-short-description';

test(`Should return the relative mechanic short description.`, () => {
  const string = `%RETURN%`;
  const result = getMechanicShortDescription(string);
  expect(result).toEqual(`Move minion from board to hand.`);
});
