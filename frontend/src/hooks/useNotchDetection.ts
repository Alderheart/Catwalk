import { useState, useEffect } from 'react';

interface NotchInfo {
  hasNotch: boolean;
  safeAreaTop: number;
  safeAreaBottom: number;
  safeAreaLeft: number;
  safeAreaRight: number;
}

export const useNotchDetection = (): NotchInfo => {
  const [notchInfo, setNotchInfo] = useState<NotchInfo>({
    hasNotch: false,
    safeAreaTop: 0,
    safeAreaBottom: 0,
    safeAreaLeft: 0,
    safeAreaRight: 0,
  });

  useEffect(() => {
    const detectNotch = () => {
      // Create a test element to read CSS environment variables
      const testEl = document.createElement('div');
      testEl.style.position = 'fixed';
      testEl.style.top = '0';
      testEl.style.left = '0';
      testEl.style.visibility = 'hidden';
      testEl.style.paddingTop = 'env(safe-area-inset-top)';
      testEl.style.paddingBottom = 'env(safe-area-inset-bottom)';
      testEl.style.paddingLeft = 'env(safe-area-inset-left)';
      testEl.style.paddingRight = 'env(safe-area-inset-right)';
      
      document.body.appendChild(testEl);
      
      const computedStyle = getComputedStyle(testEl);
      const safeAreaTop = parseInt(computedStyle.paddingTop) || 0;
      const safeAreaBottom = parseInt(computedStyle.paddingBottom) || 0;
      const safeAreaLeft = parseInt(computedStyle.paddingLeft) || 0;
      const safeAreaRight = parseInt(computedStyle.paddingRight) || 0;
      
      document.body.removeChild(testEl);
      
      // Device has a notch if any safe area inset is greater than 0
      const hasNotch = safeAreaTop > 0 || safeAreaBottom > 0 || safeAreaLeft > 0 || safeAreaRight > 0;
      
      setNotchInfo({
        hasNotch,
        safeAreaTop,
        safeAreaBottom,
        safeAreaLeft,
        safeAreaRight,
      });
    };

    // Detect on mount
    detectNotch();
    
    // Re-detect on orientation change
    const handleOrientationChange = () => {
      // Small delay to ensure new dimensions are available
      setTimeout(detectNotch, 100);
    };
    
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);
    
    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, []);

  return notchInfo;
};