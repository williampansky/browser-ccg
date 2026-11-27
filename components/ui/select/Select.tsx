import { cx } from '../../../utils';

/**
 * A drop-down. Always pass `aria-label`
 * (or wrap it in a label) so it has a name.
 */
export const Select = ({
  className,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select className={cx('ui-field', className)} {...rest} />
);
