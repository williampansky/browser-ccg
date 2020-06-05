import React from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
// import HomepageHero from '@/components/site/homepage-hero/HomepageHero';
// import TheSiteHeader from '@/features/site-header/TheSiteHeader';
// import ThreeColumnCards from '@/components/site/three-column-cards/ThreeColumnCards';
// import TheSiteMobileMenu from '@/features/site-mobile-menu/TheSiteMobileMenu';
// import HerosCarousel from '@/components/site/heros-carousel';

export default function Home({ Component, pageProps }) {
  return (
    <React.Fragment>
      <Helmet
        title="Home | HSclone"
        meta={[{ property: 'og:title', content: 'Home' }]}
      />
      {/* <TheSiteHeader /> */}
      {/* <main className="site__wrapper page__homepage">
        <HomepageHero />
        <ThreeColumnCards />
        <HerosCarousel />
      </main>
      <TheSiteMobileMenu /> */}
    </React.Fragment>
  );
}

Home.propTypes = {
  Component: PropTypes.func,
  pageProps: PropTypes.object
};
