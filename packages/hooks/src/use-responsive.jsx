import { useState, useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';

/**
 * ```
 * isMobile: maxWidth(424)
 * isSmall: minWidth(425) && maxWidth(759)
 * isTablet: minWidth(760) && maxWidth(959)
 * isDesktop: minWidth(960)
 * ```
 */
function useResponsive() {
  const [isClient, setIsClient] = useState(false);

  const isMobile = useMediaQuery({
    maxWidth: 424
  });

  const isSmall = useMediaQuery({
    minWidth: 425,
    maxWidth: 759
  });

  const isTablet = useMediaQuery({
    minWidth: 760,
    maxWidth: 959
  });

  const isDesktop = useMediaQuery({
    minWidth: 960
  });

  useEffect(() => {
    if (typeof window !== 'undefined') setIsClient(true);
  }, []);

  return {
    isDesktop: isClient ? isDesktop : true,
    isTablet: isClient ? isTablet : false,
    isSmall: isClient ? isSmall : false,
    isMobile: isClient ? isMobile : false
  };
}

export default useResponsive;
