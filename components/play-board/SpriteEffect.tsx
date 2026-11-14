import { useEffect, useState } from 'react';
import { reducedMotion } from './motion';

export interface SpriteSheet {
  src: string;
  /** Frames across and down, and the size of one frame in px. Frames read left to right, then top to bottom. */
  cols: number;
  rows: number;
  frame: number;
}

/** Pipoya "Light Pillar" (variant a): 5 x 2 frames of 192 px, made to loop. */
export const LIGHT_PILLAR: SpriteSheet = { src: '/images/fx/light-pillar.png', cols: 5, rows: 2, frame: 192 };

/**
 * Plays a sprite sheet over its (position: relative) parent: one frame at a time at `fps`. `loop` repeats it; otherwise it
 * plays once and calls `onDone`. `size` is the drawn width in px (frames are square), centred on the parent.
 */
export const SpriteEffect = ({
  sheet = LIGHT_PILLAR,
  fps = 14,
  loop = false,
  size = sheet.frame,
  onDone,
}: {
  sheet?: SpriteSheet;
  fps?: number;
  loop?: boolean;
  size?: number;
  onDone?: () => void;
}) => {
  const total = sheet.cols * sheet.rows;
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reducedMotion()) {
      onDone?.();
      return;
    }
    const t = setInterval(() => {
      setI((n) => {
        if (n + 1 < total) return n + 1;
        if (loop) return 0;
        clearInterval(t);
        onDone?.();
        return n;
      });
    }, 1000 / fps);
    return () => clearInterval(t);
  }, [fps, loop, total, onDone]);
  if (reducedMotion()) return null;
  const k = size / sheet.frame;
  return (
    <span
      aria-hidden="true"
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: size,
        height: size,
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        backgroundImage: `url(${sheet.src})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: `${sheet.cols * size}px ${sheet.rows * size}px`,
        backgroundPosition: `${-(i % sheet.cols) * size}px ${-Math.floor(i / sheet.cols) * size}px`,
        imageRendering: k < 1 ? 'auto' : 'pixelated',
      }}
    />
  );
};
