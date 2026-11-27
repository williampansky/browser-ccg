import Link from 'next/link';
import { cx } from '../../../utils';

interface Props {
  href: string;
  variant?: 'primary' | 'danger';
}

/** A link that looks like a button (`href` is an internal route). */
export const LinkButton = ({
  href,
  variant,
  className,
  children,
  ...rest
}: Props & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>) => {
  const classNames = cx('ui-btn', variant && `ui-btn--${variant}`, className);
  return (
    <Link href={href}>
      <a className={classNames} {...rest}>
        {children}
      </a>
    </Link>
  );
};
