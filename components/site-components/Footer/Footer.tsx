import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaRss, FaStoreAlt } from 'react-icons/fa';
import { GiCardPick } from 'react-icons/gi';
import { RiHome4Fill, RiPlayCircleFill, RiAccountCircleFill } from 'react-icons/ri';
import { siteConfig } from '../../../app.config';
const { footerButtons } = siteConfig;

const getFooterIcon = (name: string) => {
  // prettier-ignore
  switch (name) {
    case 'Home': return <RiHome4Fill />;
    case 'Store': return <FaStoreAlt />;
    case 'Cards': return <GiCardPick />;
    case 'Play': return <RiPlayCircleFill />;
    case 'News': return <FaRss />;
    case 'Profile': return <RiAccountCircleFill />;
  }
};

/** The home button is only active on `/`; every other button also covers its sub-pages (`/deckbuilder` is under Cards). */
const isActive = (route: string, path: string) => {
  if (route === '/') return path === '/';
  if (route === '/collection') return path.startsWith('/collection') || path.startsWith('/deckbuilder');
  return path === route || path.startsWith(route + '/');
};

export const Footer = () => {
  const { pathname } = useRouter();

  return (
    <footer className='site__footer'>
      <nav className='footer__nav' aria-label='Main'>
        <ul>
          {Object.entries(footerButtons).map(([key, page]) => {
            const active = isActive(page.route, pathname);

            return (
              <li key={key}>
                <Link href={page.route}>
                  <a className={active ? 'item item--active' : 'item'} aria-current={active ? 'page' : undefined}>
                    {getFooterIcon(page.name)}
                    <span className='item__text'>{page.name}</span>
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </footer>
  );
};
