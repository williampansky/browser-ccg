import React, { ReactNode } from 'react';
import Link from 'next/link';
import Head from 'next/head';

type Props = {
  children?: ReactNode;
  title?: string;
};

export const Layout = ({ children, title = 'BCG' }: Props) => (
  <div>
    <Head>
      <title>{`BCG | ${title}`}</title>
      <meta charSet='utf-8' />
      <meta name='viewport' content='initial-scale=1.0, width=device-width' />
    </Head>
    <header>
      <nav>
        <ul
          style={{
            display: 'flex',
            flexFlow: 'row nowrap',
            alignItems: 'center',
            justifyContent: 'center',
            listStyleType: 'none',
            padding: 0
          }}
        >
          <li>
            <Link href='/'>
              <a>Home</a>
            </Link>
          </li>
          <li style={{ margin: '0 0.25em', color: 'lightgray' }}>|</li>
          <li>
            <Link href='/about'>
              <a>About</a>
            </Link>
          </li>
          <li style={{ margin: '0 0.25em', color: 'lightgray' }}>|</li>
          <li>
            <Link href='/users'>
              <a>Users List</a>
            </Link>
          </li>
          <li style={{ margin: '0 0.25em', color: 'lightgray' }}>|</li>
          <li>
            <a href='/api/users'>Users API</a>
          </li>
          <li style={{ margin: '0 0.25em', color: 'lightgray' }}>|</li>
          <li>
            <Link href='/play'>
              <a>Play</a>
            </Link>
          </li>
        </ul>
      </nav>
    </header>
    {children}
    <footer>
      <hr />
      <span>I'm here to stay (Footer)</span>
    </footer>
  </div>
);
