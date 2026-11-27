import React from 'react';
import { cx } from '../../../utils';

/** A text or search box. */
export const TextInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type = 'text', ...rest }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cx('ui-field', className)}
    {...rest}
  />
));

TextInput.displayName = 'TextInput';
