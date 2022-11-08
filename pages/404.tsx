import Head from 'next/head';
import Image from 'next/image';
import { Layout } from '../components';

import { siteConfig } from '../config.app';
const {
  pages: { home },
} = siteConfig;

export default function Custom404() {
  return (
    <Layout title={home.name} description={home.description}>
      <div className='custom404__page'>
        <div>
          <h1>404</h1>
          <code>¯\_(ツ)_/¯</code>
        </div>
      </div>
    </Layout>
  );
}
