import { useEffect, useState } from 'react';
import styles from './play-board.module.scss';
import { targetLinePath } from './target-line';

/** The aiming arrow. It owns the pointer position, so moving the mouse re-renders only this, not the whole board. */
export const AimArrow = ({ from, hit }: { from: { x: number; y: number }; hit: boolean }) => {
  const [to, setTo] = useState<{ x: number; y: number } | null>(null);
  useEffect(() => {
    const move = (e: MouseEvent) => setTo({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', move);
    window.addEventListener('dragover', move); // a native drag suppresses mousemove
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('dragover', move);
    };
  }, []);
  if (!to) return null;
  const color = hit ? '#3ddc84' : '#bbb';
  return (
    <svg className={styles.targetLine} aria-hidden="true">
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 z" fill={color} />
        </marker>
      </defs>
      <path
        d={targetLinePath(from, to, 'curve')}
        fill="none"
        stroke={color}
        strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray={hit ? undefined : '8 6'}
        markerEnd="url(#arrowhead)"
      />
    </svg>
  );
};
