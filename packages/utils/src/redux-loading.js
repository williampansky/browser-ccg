/**
 * @returns state.isLoading = true;
 * @param {Object} state
 */
export const loadingStart = state => {
  state.isLoading = true;
};

/**
 * @returns state.isLoading = false;
 * @returns state.error = payload.toString();
 * @param {Object} state
 * @param {Object} payload
 */
export const loadingFailed = (state, { payload }) => {
  state.isLoading = false;
  state.error = payload.toString();
};

/**
 * @returns state.error = null;
 * @returns state.isLoading = false;
 * @param {Object} state
 */
export const loadingSuccess = state => {
  state.isLoading = false;
  state.error = null;
};
