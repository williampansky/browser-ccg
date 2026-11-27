import React from 'react';
import { cx } from '../../../utils';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
};

/** A button. `type` defaults to "button" (never submits a form by accident). */
export const Button = React.forwardRef<HTMLButtonElement, Props>(
  ({ variant, className, size, type = 'button', ...rest }, ref) => {
    const classNames = cx(
      'ui-btn',
      variant && `ui-btn--${variant}`,
      size && `ui-btn--${size}`,
      className,
    );

    return <button ref={ref} type={type} className={classNames} {...rest} />;
  },
);

Button.displayName = 'Button';
