import React from 'react';
import cx from '../../../utils/cx';

/** A quieter box inside a panel (a settings group). */
export const Group = ({
  className,
  ...rest
}: React.HTMLAttributes<HTMLElement>) => (
  <section className={cx('ui-group', className)} {...rest} />
);
