import { SegmentedControl } from '../../ui/ui';
import { SizeId, SIZES } from '../collection-model';

const cardSizeSegmentOptions = SIZES.map((option) => ({
  label: option.label,
  title: `${option.label} cards`,
  value: option.id,
}));

interface Props {
  onPickSizeChange: (id: SizeId) => void;
  size: SizeId;
}

/**
 * A collection of buttons for displaying the size of the card previews.
 */
export const CollectionCardSizeControl = ({
  onPickSizeChange,
  size,
}: Props) => {
  return (
    <SegmentedControl
      ariaLabel="Card size"
      chips
      onChange={onPickSizeChange}
      options={cardSizeSegmentOptions}
      value={size}
    />
  );
};
