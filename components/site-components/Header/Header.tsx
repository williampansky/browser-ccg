import { Nav } from '../Nav';
import { siteConfig } from '../../../app.config';
import { useState } from 'react';
import cx from '../../../utils/cx';

export const Header = () => {
  const [active, setActive] = useState<boolean>(false);
  const closeIcon = '/images/icons/icon-uikit-close.svg';
  const menuIcon = '/images/icons/icon-uikit-menu.svg';

  const onClick = (e: any) => {
    e.preventDefault();
    e.target.blur();
    setActive(!active);
  };

  return (
    <header className={cx('site__header', active ? 'active' : '')}>
      <div className="text__value">
        <span>{siteConfig.longName}</span>
        <div className="semver">
          <code>{`v${siteConfig.version}`}</code>
        </div>
      </div>

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
