import { loadingFailed, loadingStart, loadingSuccess } from '../redux-loading';

test(`default test to pass fail`, () => {
  const state = true;
  expect(state).toBe(true);
});

// @TODO
// test(`Should return an object; with loading false & an error string.`, () => {
//   const state = {
//     isLoading: true,
//     error: null
//   };

//   const result = loadingFailed(state, { error: 'An error has occured.' });

//   expect(result).toEqual({
//     isLoading: false,
//     error: 'An error has occured.'
//   });
// });

// test(`Should return true.`, () => {
//   const state = { isLoading: false };
//   const result = loadingStart(state);
//   console.log(result);
//   expect(result.isLoading).toBe(true);
// });

// test(`Should return an object; with loading true & a null error.`, () => {
//   const state = { isLoading: true, error: null };
//   const result = loadingSuccess(state);
//   expect(result).toEqual({ isLoading: false, error: null });
// });
