import {
  LAYOUT_TIERS,
  MEDIUM_MEDIA,
  type LayoutTier,
} from '../play-board/layout-css';

const TIER_LABEL: Record<LayoutTier, string> = {
  large: 'Large',
  medium: 'Medium',
  small: 'Small',
};

/**
 * Which screen size's layout the lab edits, and a switch for the real-size
 * preview of it.
 */
export const LabTierSwitch = ({
  isPreviewOn,
  onPreviewToggle,
  setParams,
  tier,
}: {
  isPreviewOn: boolean;
  onPreviewToggle: () => void;
  setParams: (changes: Record<string, string | null>) => void;
  tier: LayoutTier;
}) => {
  const hint =
    tier === 'large'
      ? 'the base layout; medium and small start from it'
      : tier === 'medium'
        ? `a window up to ${MEDIUM_MEDIA}; bake with --tier=medium`
        : 'a phone, laid out wide and scaled down; bake with --tier=small';

  return (
    <div style={{ marginBottom: 6 }}>
      Screen size:{' '}
      {LAYOUT_TIERS.map((value) => (
        <button
          key={value}
          aria-pressed={tier === value}
          onClick={() => setParams({ dev: value === 'large' ? null : value })}
          style={{ marginRight: 4, fontWeight: tier === value ? 700 : 400 }}
        >
          {TIER_LABEL[value]}
        </button>
      ))}
      <button aria-pressed={isPreviewOn} onClick={onPreviewToggle}>
        Preview
      </button>
      <div style={{ color: '#9aa3b8', fontSize: 11 }}>{hint}</div>
    </div>
  );
};
