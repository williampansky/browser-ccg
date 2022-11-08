import Link from 'next/link';
import { Fragment } from 'react';
import { siteConfig } from '../../../config.app';
const { pages } = siteConfig;

export const Nav = () => (
  <nav className='site__nav'>
    <ul>
      {Object.entries(pages).map((p, i: number) => {
        const key = p[0];
        const page = p[1];

        return page.showInNav ? (
          <Fragment key={key}>
            <li>
              <Link href={page.route}>
                <a>{page.name}</a>
              </Link>
            </li>

            {/* {i !== Object.keys(pages).length - 1 && (
              <li style={{ margin: '0 0.25em', color: 'lightgray' }}>|</li>
            )} */}
          </Fragment>
        ) : null;
      })}
    </ul>
  </nav>
);
