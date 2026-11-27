import { useEffect, useState } from 'react';
import type { ParsedUrlQuery } from 'querystring';
import type { LayoutTier } from '../play-board/layout-css';
import { PHONE_PARAM } from '../play-board/use-is-phone';

/**
 * The window each tier is previewed in. A phone's page is laid out about 1650
 * wide by 760 tall and scaled down (see `phone-viewport.ts`), so that is what
 * the small preview shows, not the phone's own pixels.
 */
export const TIER_SIZE: Record<LayoutTier, { height: number; width: number }> =
  {
    large: { height: 810, width: 1440 },
    medium: { height: 700, width: 1024 },
    small: { height: 760, width: 1647 },
  };

const PREVIEW_DELAY_MS = 400;
const MAX_WIDTH_SHARE = 0.55;
const MAX_HEIGHT_SHARE = 0.8;

/** The lab's current setup and knobs as a /play/local URL. */
const previewUrl = (query: ParsedUrlQuery, tier: LayoutTier): string => {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    const text = Array.isArray(value) ? value[0] : value;
    if (key !== 'dev' && text !== undefined) params.set(key, text);
  });
  if (tier === 'small') params.set(PHONE_PARAM, 'phone');

  return `/play/local?${params.toString()}`;
};

/**
 * A real-size copy of the board in an iframe, so the media queries (and the
 * saved tier overrides) behave as they would on that screen. It reloads a
 * moment after the lab's knobs stop changing. Lab-only previews (the `...pv`
 * switches) are not part of /play, so they will not show here.
 */
export const TierPreview = ({
  onClose,
  query,
  tier,
}: {
  onClose: () => void;
  query: ParsedUrlQuery;
  tier: LayoutTier;
}) => {
  const url = previewUrl(query, tier);
  const [src, setSrc] = useState(url);
  const [viewport, setViewport] = useState({ height: 800, width: 1400 });
  const { height, width } = TIER_SIZE[tier];

  useEffect(() => {
    const timer = setTimeout(() => setSrc(url), PREVIEW_DELAY_MS);

    return () => clearTimeout(timer);
  }, [url]);

  useEffect(() => {
    const measure = () =>
      setViewport({ height: window.innerHeight, width: window.innerWidth });
    measure();
    window.addEventListener('resize', measure);

    return () => window.removeEventListener('resize', measure);
  }, []);

  const scale = Math.min(
    1,
    (viewport.width * MAX_WIDTH_SHARE) / width,
    (viewport.height * MAX_HEIGHT_SHARE) / height,
  );

  return (
    <div
      style={{
        background: '#10131c',
        border: '1px solid #3a4260',
        borderRadius: 6,
        bottom: 12,
        color: '#cdd3e4',
        fontSize: 12,
        left: 12,
        padding: 6,
        position: 'fixed',
        zIndex: 100000,
      }}
    >
      <div style={{ marginBottom: 4 }}>
        Preview: {tier} ({width} x {height}, shown at {Math.round(scale * 100)}
        %){' '}
        <a style={{ cursor: 'pointer', color: '#7aa2ff' }} onClick={onClose}>
          close
        </a>
      </div>
      <div style={{ height: height * scale, width: width * scale }}>
        <iframe
          key={tier}
          src={src}
          title="Board preview"
          style={{
            border: 0,
            height,
            transform: `scale(${scale})`,
            transformOrigin: '0 0',
            width,
          }}
        />
      </div>
    </div>
  );
};
