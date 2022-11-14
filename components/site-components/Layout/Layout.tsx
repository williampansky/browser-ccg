import React, { Fragment, ReactNode } from 'react';
import Link from 'next/link';
import Head from 'next/head';

import { Footer } from '../Footer';
import { Header } from '../Header';

type Props = {
  children?: ReactNode;
  title?: string;
  description?: string;
};

export const Layout = ({ children, title, description }: Props) => (
  <Fragment>
    <Head>
      <title>{`BCG | ${title}`}</title>
      <meta charSet='utf-8' />
      <meta name='viewport' content='initial-scale=1.0, width=device-width' />
      <meta
        name='description'
        property='og:description'
        content={description}
      />
    </Head>
    
    <Header />
    <main className='site__main'>{children}</main>
    <Footer />
  </Fragment>
);
