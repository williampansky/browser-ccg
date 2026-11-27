import { cx } from '../../../utils';
import { AnimatedIcon } from '../AnimatedIcon';

type CheckboxProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'onChange' | 'checked'
> & {
  checked: boolean;
  /** Called with the new value. */
  onChange: (checked: boolean) => void;
  /**
   * Goes on the label (the box is tiny, a hover title belongs on the whole
   * thing).
   */
  title?: string;
};

/** A labelled checkbox: `<Checkbox checked onChange>Label</Checkbox>`. */
export const Checkbox = ({
  checked,
  onChange,
  children,
  title,
  className,
  ...rest
}: CheckboxProps) => (
  <label
    className={cx('ui-check', rest.disabled && 'ui-check--disabled', className)}
    title={title}
  >
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      {...rest}
    />

    <i aria-hidden="true">
      {/* The tick is the cross-into-checkmark animation: it is drawn in on check and fades on uncheck, so the starting cross never shows while unchecked. */}
      <AnimatedIcon
        name="cross-into-checkmark"
        on={checked}
        hideWhenOff
        size={0}
        style={{ width: '100%', height: '100%' }}
      />
    </i>

    {children !== undefined && <span>{children}</span>}
  </label>
);
