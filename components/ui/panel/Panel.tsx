import React from 'react';
import { cx } from '../../../utils';

/**
 * A titled box (menus, dialogs). Layout (width, padding, gap) comes from
 * `className`; the look from the theme.
 */
export const Panel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...rest }, ref) => (
  <div ref={ref} className={cx('ui-panel', className)} {...rest} />
));

Panel.displayName = 'Panel';
