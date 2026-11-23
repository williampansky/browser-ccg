import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';

/**
 * The lab's floating panel: dragged by its header (double-click docks it top
 * right), resized by its edge, hidden with Hide. Position and width are
 * remembered.
 */
export const LabOverlay = ({
  onSetAll,
  children,
}: {
  onSetAll: (open: boolean) => void;
  children: React.ReactNode;
}) => {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  // The overlay's position (top-left corner, px); null = docked top right.
  // Dragged by its header, remembered in localStorage.
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ dx: number; dy: number } | null>(null);
  useEffect(() => {
    try {
      const saved = JSON.parse(
        window.localStorage.getItem('ccg.boardlab.pos') ?? 'null',
      );
      if (saved && typeof saved.x === 'number' && typeof saved.y === 'number')
        setPos(saved);
    } catch {
      /* no saved position */
    }
  }, []);
  // The overlay's width (px): dragged by the panel's outer edge (left edge
  // while docked top right, since the right side is pinned).
  const [width, setWidth] = useState(250);
  const resize = useRef<{ x: number; w: number } | null>(null);
  useEffect(() => {
    const saved = parseInt(
      window.localStorage.getItem('ccg.boardlab.width') ?? '',
      10,
    );
    if (saved >= 200 && saved <= 1000) setWidth(saved);
  }, []);
  const startResize = (e: React.PointerEvent<HTMLDivElement>) => {
    resize.current = { x: e.clientX, w: width };
    e.currentTarget.setPointerCapture(e.pointerId);
    e.stopPropagation();
  };
  const moveResize = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!resize.current) return;
    const dx = e.clientX - resize.current.x;
    setWidth(
      Math.min(1000, Math.max(200, resize.current.w + (pos ? dx : -dx))),
    );
  };
  const endResize = () => {
    if (!resize.current) return;
    resize.current = null;
    window.localStorage.setItem('ccg.boardlab.width', String(width));
  };
  const clamp = (x: number, y: number) => ({
    x: Math.min(Math.max(0, x), Math.max(0, window.innerWidth - 60)),
    y: Math.min(Math.max(0, y), Math.max(0, window.innerHeight - 30)),
  });
  const startDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    const r = boxRef.current!.getBoundingClientRect();
    drag.current = { dx: e.clientX - r.left, dy: e.clientY - r.top };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const moveDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (drag.current)
      setPos(clamp(e.clientX - drag.current.dx, e.clientY - drag.current.dy));
  };
  const endDrag = () => {
    if (!drag.current) return;
    drag.current = null;
    if (pos)
      window.localStorage.setItem('ccg.boardlab.pos', JSON.stringify(pos));
  };

  const box = {
    position: 'fixed',
    zIndex: 2000,
    ...(pos ? { left: pos.x, top: pos.y } : { top: 8, right: 8 }),
    font: '13px system-ui, sans-serif',
    color: '#e8eaf2',
  } as const;
  return (
    <div ref={boxRef} style={box}>
      <div
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onDoubleClick={() => {
          setPos(null);
          window.localStorage.removeItem('ccg.boardlab.pos');
        }}
        title="Drag to move; double-click to dock top right"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          padding: '4px 6px 4px 10px',
          borderRadius: 6,
          border: '1px solid #3a4052',
          background: '#232634',
          cursor: 'grab',
          touchAction: 'none',
          userSelect: 'none',
        }}
      >
        <span>⠿ Board lab</span>
        <button
          onClick={() => setOpen(!open)}
          style={{
            padding: '2px 8px',
            borderRadius: 4,
            border: '1px solid #3a4052',
            background: '#14161c',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          {open ? 'Hide' : 'Show'}
        </button>
      </div>
      {open && (
        <div style={{ position: 'relative', marginTop: 6, width }}>
          <div
            onPointerDown={startResize}
            onPointerMove={moveResize}
            onPointerUp={endResize}
            onPointerCancel={endResize}
            onDoubleClick={() => {
              setWidth(250);
              window.localStorage.removeItem('ccg.boardlab.width');
            }}
            title="Drag to resize; double-click to reset the width"
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              [pos ? 'right' : 'left']: -4,
              width: 9,
              cursor: 'ew-resize',
              touchAction: 'none',
              zIndex: 1,
            }}
          />
          <div
            style={{
              width: '100%',
              maxHeight: pos
                ? `calc(100vh - ${pos.y + 50}px)`
                : 'calc(100vh - 60px)',
              overflow: 'auto',
              padding: 12,
              borderRadius: 10,
              border: '1px solid #3a4052',
              background: 'rgba(20,22,28,0.94)',
              boxShadow: '0 6px 24px #000a',
            }}
          >
            <div style={{ marginBottom: 6 }}>
              <button onClick={() => onSetAll(false)}>Collapse all</button>{' '}
              <button onClick={() => onSetAll(true)}>Expand all</button>
            </div>
            {children}
            <button
              onClick={() =>
                router.replace(router.pathname, undefined, { shallow: true })
              }
              style={{ marginTop: 8 }}
            >
              Reset everything
            </button>
            <p style={{ color: '#9aa3b8', fontSize: 11 }}>
              The URL holds all of it: copy it to keep a layout.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
