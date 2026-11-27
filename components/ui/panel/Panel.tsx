import React from 'react';
import { cx } from '../../../utils';

interface PanelProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'div' | 'section';
}

/**
 * A titled box (menus, dialogs). Layout (width, padding, gap) comes from
 * `className`; the look from the theme.
 */
export const Panel = React.forwardRef<HTMLElement, PanelProps>(
  ({ as: Component = 'div', className, ...rest }, ref) => (
    <Component
      ref={ref as React.Ref<any>}
      className={cx('ui-panel', className)}
      {...rest}
    />
  ),
);

Panel.displayName = 'Panel';
