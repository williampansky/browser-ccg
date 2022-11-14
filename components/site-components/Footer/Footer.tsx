import Image from 'next/image';
import Link from 'next/link';
import { FaRss, FaStoreAlt } from 'react-icons/fa';
import { GiCardPick } from 'react-icons/gi';
import { RiPlayCircleFill, RiAccountCircleFill } from 'react-icons/ri';
import { siteConfig } from '../../../app.config';
const { footerButtons } = siteConfig;

const getFooterIcon = (name: string) => {
  // prettier-ignore
  switch (name) {
    case 'Store': return <FaStoreAlt />;
    case 'Cards': return <GiCardPick />;
    case 'Play': return <RiPlayCircleFill />;
    case 'News': return <FaRss />;
    case 'Profile': return <RiAccountCircleFill />;
  }
}

// FaStoreAlt
export const Footer = () => (
  <footer className='site__footer'>
    <nav className='footer__nav'>
      <ul>
        {Object.entries(footerButtons).map((p, i: number) => {
          const key = p[0];
          const page = p[1];
          const isPlayPage = p[1].route === '/play';

          return (
            <li key={key}>
              <Link href={page.route}>
                <a className='item'>
                  {/* <Image
                    alt={page.name}
                    className='item__icon'
                    color='inherit'
                    height={isPlayPage ? 20 : 20}
                    width={isPlayPage ? 20 : 20}
                    priority
                    role='presentation'
                    src={`/images/icons/${page.icon}.svg`}
                  /> */}
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
