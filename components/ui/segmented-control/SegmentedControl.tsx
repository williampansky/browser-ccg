import { cx } from '../../../utils';

export interface SegmentOption<T extends string | number | boolean> {
  disabled?: boolean;
  label: React.ReactNode;
  title?: string;
  value: T;
}

interface Props<T extends string | number | boolean> {
  ariaLabel?: string;
  chips?: boolean;
  className?: string;
  /** Disables every option. */
  disabled?: boolean;
  label?: string;
  onChange: (value: T) => void;
  options: SegmentOption<T>[];
  value: T;
}

/**
 * A choice of one: a labelled segmented control (`label` shows on the left,
 * e.g. Opponent) or, with `chips`, a row of small separate
 * buttons (mana cost, card size). Radio semantics either way.
 */
export function SegmentedControl<T extends string | number | boolean>({
  ariaLabel,
  chips,
  className,
  disabled,
  label,
  onChange,
  options,
  value,
}: Props<T>) {
  return (
    <div
      aria-label={ariaLabel ?? label}
      className={cx('ui-seg', chips && 'ui-seg--chips', className)}
      role="radiogroup"
    >
      {label && <span>{label}</span>}
      {options.map((o) => (
        <button
          aria-checked={o.value === value}
          disabled={disabled || o.disabled}
          key={String(o.value)}
          onClick={() => onChange(o.value)}
          role="radio"
          title={o.title}
          type="button"
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
