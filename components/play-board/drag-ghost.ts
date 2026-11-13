// A custom drag ghost. The browser's own drag image is always drawn semi-transparent (the board lines show through the
// card text), so a dragged card hides it and this fully opaque clone follows the pointer instead, with a little motion:
// a pop on pickup, a lag behind the pointer and a tilt into the direction of travel while moving, and a settle on release.

const FOLLOW = 0.3; // how much of the gap to the pointer is closed each frame (lower = floatier)
const TILT_PER_PX = 1.6; // degrees of 3D tilt per pixel of speed per frame (the collection page's tilt, driven by motion)
const MAX_TILT = 22; // degrees
const MAX_ROLL = 8; // degrees of sideways roll

export type DragGhost = { stop: () => void };

const clamp = (v: number, m: number) => Math.max(-m, Math.min(m, v));

export const startDragGhost = (source: HTMLElement, width: number, height: number, x: number, y: number): DragGhost => {
  const el = source.cloneNode(true) as HTMLElement;
  el.removeAttribute('id');
  el.style.cssText = [
    'position:fixed',
    'left:0',
    'top:0',
    `width:${width}px`,
    `height:${height}px`,
    'margin:0',
    'pointer-events:none',
    'z-index:10000',
    'opacity:1',
    'visibility:visible',
    'filter:drop-shadow(0 14px 18px rgba(0,0,0,0.55))',
    'transition:none',
    'animation:none',
    'will-change:transform',
  ].join(';');
  document.body.appendChild(el);

  let tx = x;
  let ty = y;
  let cx = x;
  let cy = y;
  let rx = 0;
  let ry = 0;
  let roll = 0;
  let scale = 0.9; // pickup: pops up to 1.06
  let scaleTarget = 1.06;
  let raf = 0;
  let done = false;
  let settling = false;

  const onOver = (e: DragEvent) => {
    // Accepting the drag everywhere makes a drop on empty space a real drop, so the browser ends the drag at once
    // instead of playing its slow snap-back animation first (that was the long delay before a cancelled card returned).
    e.preventDefault();
    if (e.clientX === 0 && e.clientY === 0) return;
    tx = e.clientX;
    ty = e.clientY;
  };
  document.addEventListener('dragover', onOver);

  const frame = () => {
    const dx = (tx - cx) * (settling ? 0.4 : FOLLOW);
    const dy = (ty - cy) * (settling ? 0.4 : FOLLOW);
    cx += dx;
    cy += dy;
    // Moving right tips the card's right edge away (rotateY), moving down tips its bottom away (rotateX).
    ry += (clamp(dx * TILT_PER_PX, MAX_TILT) - ry) * 0.2;
    rx += (clamp(-dy * TILT_PER_PX, MAX_TILT) - rx) * 0.2;
    roll += (clamp(dx * 0.6, MAX_ROLL) - roll) * 0.2;
    scale += (scaleTarget - scale) * 0.25;
    el.style.transform = `translate(${cx - width / 2}px, ${cy - height / 2}px) perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${roll}deg) scale(${scale})`;
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);

  const finish = () => {
    cancelAnimationFrame(raf);
    el.remove();
  };

  // Released: if the card was played its hand button is gone (fade out where it is); if not, fly back to its hand slot.
  const stop = () => {
    if (done) return;
    done = true;
    document.removeEventListener('dragover', onOver);
    document.removeEventListener('drop', stop, true);
    document.removeEventListener('dragend', stop, true);
    setTimeout(() => {
      if (source.isConnected) {
        const r = source.getBoundingClientRect();
        settling = true;
        tx = r.left + r.width / 2;
        ty = r.top + r.height / 2;
        scaleTarget = 1;
        el.style.transition = 'opacity 120ms ease-in 90ms';
        el.style.opacity = '0';
        setTimeout(finish, 220);
      } else {
        scaleTarget = 0.8;
        el.style.transition = 'opacity 100ms ease-out';
        el.style.opacity = '0';
        setTimeout(finish, 120);
      }
    }, 30);
  };
  // A played card unmounts its own button, so dragend may never reach the page: the drop itself ends the ghost too.
  document.addEventListener('drop', stop, true);
  document.addEventListener('dragend', stop, true);

  return { stop };
};
