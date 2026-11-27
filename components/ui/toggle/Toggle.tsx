import { cx } from '../../../utils';

interface Props {
  checked: boolean;
  className?: string;
  disabled?: boolean;
  label: React.ReactNode;
  onChange: (on: boolean) => void;
}

/** A switch row: the label on the left, the switch on the right. */
export const Toggle = ({
  checked,
  className,
  disabled,
  label,
  onChange,
}: Props) => (
  <button
    aria-checked={checked}
    className={cx('ui-toggle', className)}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    role="switch"
    type="button"
  >
    <span>{label}</span>
    <i aria-hidden="true" />
  </button>
);
