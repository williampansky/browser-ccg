import Image from 'next/image';
import Link from 'next/link';
import { Fragment } from 'react';
import { siteConfig } from '../../../config.app';
const { footerButtons } = siteConfig;

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
                  <Image
                    alt={page.name}
                    className='item__icon'
                    color='inherit'
                    height={isPlayPage ? 40 : 20}
                    width={isPlayPage ? 40 : 20}
                    priority
                    role='presentation'
                    src={`/images/icons/${page.icon}.svg`}
                  />
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
