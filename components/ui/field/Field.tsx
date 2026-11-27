import React from 'react';
import cx from '../../../utils/cx';

interface FieldProps extends React.HTMLAttributes<HTMLElement> {
  /** `label` wraps one control; `div` suits a group (swatches, chips). */
  as?: 'label' | 'div';
  label: string;
  /** Id for the label text, so a group can point `aria-labelledby` at it. */
  labelId?: string;
}

/**
 * A control with its caption above it. Every screen uses this so label size,
 * colour and spacing stay the same everywhere.
 */
export const Field = ({
  as: Component = 'label',
  children,
  className,
  label,
  labelId,
  ...rest
}: FieldProps) => (
  <Component className={cx('ui-field-row', className)} {...rest}>
    <span className="ui-field-label" id={labelId}>
      {label}
    </span>
    {children}
  </Component>
);
