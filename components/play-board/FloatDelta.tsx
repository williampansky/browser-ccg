import { useEffect, useRef, useState } from 'react';
import { IMPACT_MS, reducedMotion } from './motion';
import styles from './float-delta.module.scss';

interface Pop {
  id: number;
  amount: number;
}

/**
 * A number that floats up and fades each time `value` changes: red `-3` for damage, green `+2` for healing. It waits for the
 * hit to land (`IMPACT_MS`) so it appears on contact, not before the attacker arrives. The first render never pops.
 */
export const FloatDelta = ({ value, gain = 'heal' }: { value: number; gain?: 'heal' | 'buff' }) => {
  const last = useRef(value);
  const next = useRef(1);
  const [pops, setPops] = useState<Pop[]>([]);
  useEffect(() => {
    const diff = value - last.current;
    last.current = value;
    if (diff === 0 || reducedMotion()) return;
    const id = next.current++;
    const timers = [
      setTimeout(() => setPops((p) => [...p, { id, amount: diff }]), diff < 0 ? IMPACT_MS : 0),
      setTimeout(() => setPops((p) => p.filter((x) => x.id !== id)), (diff < 0 ? IMPACT_MS : 0) + 1000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [value]);
  return (
    <>
      {pops.map((p) => (
        <span key={p.id} className={[styles.pop, p.amount < 0 ? styles.hurt : styles[gain]].join(' ')} aria-hidden="true">
          {p.amount > 0 ? `+${p.amount}` : p.amount}
        </span>
      ))}
    </>
  );
};
