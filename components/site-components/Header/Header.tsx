import { e } from 'mathjs';
import Link from 'next/link';
import { Fragment, useState } from 'react';
import { siteConfig } from '../../../config.app';
import { Nav } from '../Nav';
const { pages } = siteConfig;

export const Header = () => {
  const [active, setActive] = useState<boolean>(false);
  const closeIcon = '/images/icons/icon-uikit-close.svg';
  const menuIcon = '/images/icons/icon-uikit-menu.svg';

  const onClick = (e: any) => {
    e.preventDefault();
    e.target.blur();
    setActive(!active);
  }

  return (
    <header className={['site__header', active ? 'active' : ''].join(' ')}>
      <div className='text__value'>{siteConfig.longName}</div>
      <button onClick={onClick}>
        <img
          src={active ? closeIcon : menuIcon}
          style={{
            filter: !active ? 'invert(1)' : '',
          }}
        />
      </button>
      <Nav />
    </header>
  );
};
