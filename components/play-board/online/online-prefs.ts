const KEY = 'ccg.online.v1';

/** Whether the player last chose to skip the queue and play a bot. */
export const loadVsBot = (): boolean => {
  try {
    return window.localStorage.getItem(KEY) === 'bot';
  } catch {
    return false;
  }
};

export const saveVsBot = (vsBot: boolean): void => {
  try {
    window.localStorage.setItem(KEY, vsBot ? 'bot' : 'queue');
  } catch {
    /* storage blocked: the choice is just not remembered */
  }
};
