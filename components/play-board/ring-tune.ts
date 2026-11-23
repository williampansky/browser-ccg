import { RING_DEFAULTS, RingTune } from './HeroVariants';

/**
 * The ring's settings from a URL query string: `r_<field>` params over
 * RING_DEFAULTS (the same params the hero lab writes, so a
 * lab URL's setup carries over to the board). Numbers, 6-digit hex colours and
 * on/off flags (`1` / `0`); anything else is ignored.
 */
export const parseRingTune = (search: string): RingTune => {
  const params = new URLSearchParams(search);
  const tune: Record<string, number | string | boolean> = { ...RING_DEFAULTS };
  (Object.keys(RING_DEFAULTS) as (keyof RingTune)[]).forEach((field) => {
    const raw = params.get(`r_${field}`);
    if (raw === null) return;
    const base = RING_DEFAULTS[field];
    if (typeof base === 'boolean') {
      if (raw === '0' || raw === '1') tune[field] = raw === '1';
    } else if (typeof base === 'string') {
      if (/^[0-9a-f]{6}$/i.test(raw)) tune[field] = raw;
    } else if (raw !== '' && !Number.isNaN(+raw)) {
      tune[field] = +raw;
    }
  });
  return tune as unknown as RingTune;
};
