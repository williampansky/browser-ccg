const KEY = 'ccg.delayDamage.v1';

/**
 * Whether damage (the numbers, the shake, the health shown) waits until a
 * spell's whole effect has finished playing, instead of landing at its first
 * impact. On unless the player turned it off; kept in this browser.
 */
export const loadDelayDamage = (): boolean => {
  try {
    return window.localStorage.getItem(KEY) !== 'off';
  } catch {
    return true;
  }
};

export const saveDelayDamage = (isOn: boolean): void => {
  try {
    window.localStorage.setItem(KEY, isOn ? 'on' : 'off');
  } catch {
    /* storage blocked: the choice is just not remembered */
  }
};
