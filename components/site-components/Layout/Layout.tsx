import React, { Fragment, ReactNode } from 'react';
import { useSelector } from 'react-redux';
import Head from 'next/head';

import type { RootState } from '../../../store';
import { Footer } from '../Footer';
import { Header } from '../Header';

type Props = {
  children?: ReactNode;
  title?: string;
  description?: string;
};

export const Layout = ({ children, title, description }: Props) => {
  const abSize = useSelector(({ addressBarSize }: RootState) => addressBarSize);

  return (
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
      <main
        className='site__main'
        style={{
          height: `calc((100vh - 84px) - ${abSize}px)`,
          maxHeight: `calc((100vh - 84px) - ${abSize}px)`,
          minHeight: `calc((100vh - 84px) - ${abSize}px)`,
        }}
      >
        <>
          {children}
          <Footer />
        </>
      </main>
    </Fragment>
  );
};
