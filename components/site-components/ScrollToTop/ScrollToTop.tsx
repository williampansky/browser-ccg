import Link from 'next/link';
import { Fragment, useEffect, useState } from 'react';
import { siteConfig } from '../../../app.config';
import styles from './scroll-to-top.module.scss';
const { pages } = siteConfig;

interface ScrollToTopProps {
  top?: number;
  smooth?: boolean;
  parentSelector?: string;
}

/**
 * Component used to scroll container viewport back to the top.
 * Forked from github.com/HermanNygaard/react-scroll-to-top
 */
export const ScrollToTop = ({
  top = 40,
  smooth = true,
  parentSelector = '.collection__page',
}: ScrollToTopProps) => {
  const [visible, setVisible] = useState<boolean>(false);

  const scrollToTopFunc = (smooth: boolean = false) => {
    if (typeof window !== 'undefined') {
      const el = document?.querySelector(parentSelector);
      if (el && smooth) {
        el.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      } else {
        if (el) el.scrollTop = 0;
      }
    }
  };

  useEffect(() => {
    const el = document?.querySelector(parentSelector);
    const onScroll = () => {
      if (el) setVisible(el.scrollTop >= top);
      else setVisible(false);
    };

    onScroll();
    el?.addEventListener('scroll', onScroll);
    return () => el?.removeEventListener('scroll', onScroll);
  }, [top]);

  return visible ? (
    <button
      className={[styles['component'], 'bccg-animation-slide-bottom'].join(' ')}
      data-component='ScrollToTop'
      onClick={() => scrollToTopFunc(smooth)}
      aria-label='Scroll to top'
    >
      <span className="bccg-icon" uk-icon="triangle-up"><svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><polygon points="5 13 10 8 15 13"></polygon></svg></span>
    </button>
  ) : null;
};
