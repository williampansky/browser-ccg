import Head from 'next/head';
import Image from 'next/image';
import { Layout } from '../components';

import { siteConfig } from '../app.config';
const {
  pages: { home },
} = siteConfig;

export default function HomePage() {
  return (
    <Layout title={home.name} description={home.description}>
      <div className='home__page'>
        <img
          alt={''}
          className={'home__img'}
          role='presentation'
          src={'/images/sets/PLACEHOLDER.jpg'}
        />
      </div>
    </Layout>
  );
}
