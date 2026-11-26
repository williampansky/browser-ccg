import { useEffect, useRef, useState } from 'react';
import { getImpactMs, reducedMotion } from './motion';

/**
 * A number to show for `value` that goes DOWN only when the hit lands: it keeps
 * showing the old number for `getImpactMs()` (the same wait the floating
 * damage number, the hurt flash and the shake use), so the badge, the number
 * that floats up and the shake all arrive together. A rise (a heal, a buff)
 * shows at once. The game's real value is never held back: only what is drawn.
 */
export const useImpactDelayed = (value: number): number => {
  const [shown, setShown] = useState(value);
  const last = useRef(value);

  useEffect(() => {
    const before = last.current;
    last.current = value;

    if (value >= before || reducedMotion()) {
      setShown(value);
      return;
    }

    const timer = setTimeout(() => setShown(value), getImpactMs());
    return () => clearTimeout(timer);
  }, [value]);

  return shown;
};
