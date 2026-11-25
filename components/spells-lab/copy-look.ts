import { SPELL_FX_DEFAULTS } from '../play-board/spell-fx-tune';
import type { SpellFxTune } from '../play-board/spell-fx-tune';

/**
 * The `s_<field>` params that turn `target` (the look a spell has now) into
 * `source` (the look being copied): only the fields that differ, so the URL
 * stays short and baking it stores just the difference.
 */
export const copyLookParams = (
  source: SpellFxTune,
  target: SpellFxTune,
): Record<string, string> => {
  const params: Record<string, string> = {};
  (Object.keys(SPELL_FX_DEFAULTS) as (keyof SpellFxTune)[]).forEach((field) => {
    const value = source[field];
    if (value === target[field]) return;
    params[`s_${field}`] =
      typeof value === 'boolean' ? (value ? '1' : '0') : String(value);
  });
  return params;
};
