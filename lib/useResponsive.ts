import { useState, useEffect } from 'react';
import { Dimensions, Platform } from 'react-native';

export type ScreenSize = 'mobile' | 'tablet' | 'desktop';

export function useResponsive() {
  const [dimensions, setDimensions] = useState(() => Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  const { width } = dimensions;

  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;

  const screenSize: ScreenSize = isDesktop ? 'desktop' : isTablet ? 'tablet' : 'mobile';

  const isWeb = Platform.OS === 'web';

  return {
    width,
    height: dimensions.height,
    isMobile,
    isTablet,
    isDesktop,
    screenSize,
    isWeb,
    // Sidebar should show on desktop web
    showSidebar: isDesktop && isWeb,
    // Content max width for readability
    contentMaxWidth: isDesktop ? 1200 : isTablet ? 900 : '100%',
    // Grid columns for product list
    gridColumns: isDesktop ? 4 : isTablet ? 3 : 2,
    // Spacing scale
    spacing: {
      xs: isMobile ? 4 : 8,
      sm: isMobile ? 8 : 12,
      md: isMobile ? 16 : 24,
      lg: isMobile ? 24 : 32,
      xl: isMobile ? 32 : 48,
    },
  };
}
