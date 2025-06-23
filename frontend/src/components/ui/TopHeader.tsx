/**
 * TopHeader Component
 * 
 * Fixed header with user info:
 * - User coins display (when authenticated) on the left
 * - Energy counter (when authenticated) on the right
 * - Automatic notch detection and safe area padding
 * - White/gray theme with shadow
 * 
 * Features:
 * - Real-time coin updates from authStore
 * - Real-time energy updates from energyStore
 * - Mobile-safe notch detection
 * - Responsive layout
 * - Authentication-aware UI
 */

import React, { useEffect } from 'react';
import { useNotchDetection } from '../../hooks/useNotchDetection';
import { useAuthStore } from '../../stores/authStore';
import { useEnergyStore } from '../../stores/energyStore';

const TopHeader: React.FC = () => {
  const { hasNotch, safeAreaTop } = useNotchDetection();
  const { user } = useAuthStore();
  const { currentEnergy, maxEnergy, minutesUntilNext, isAtMax, error, fetchEnergyStatus } = useEnergyStore();

  // Fetch energy status when authenticated
  useEffect(() => {
    if (user) {
      console.log('🔋 TopHeader: User authenticated, fetching energy...');
      fetchEnergyStatus();
      
      // Set up periodic refresh for energy (every 60 seconds)
      const interval = setInterval(() => {
        fetchEnergyStatus();
      }, 60000);
      
      return () => clearInterval(interval);
    }
  }, [user, fetchEnergyStatus]);

  // Debug energy values
  useEffect(() => {
    console.log('🔋 TopHeader: Energy values updated:', {
      currentEnergy,
      maxEnergy,
      minutesUntilNext,
      isAtMax,
      error
    });
  }, [currentEnergy, maxEnergy, minutesUntilNext, isAtMax, error]);
  
  return (
    <header 
      className="bg-white text-gray-500 shadow-lg"
      style={{
        paddingTop: hasNotch ? `${safeAreaTop}px` : '0px'
      }}
    >
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Coins Display */}
        {user && (
          <div className="flex items-center gap-2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full border border-yellow-300">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.736 6.979C9.208 6.193 9.696 6 10 6s.792.193 1.264.979a1 1 0 001.715-1.029C12.279 4.784 11.232 4 10 4s-2.279.784-2.979 1.95c-.285.475-.507 1-.67 1.55H6a1 1 0 000 2h.013a9.358 9.358 0 000 1H6a1 1 0 100 2h.351c.163.55.385 1.075.67 1.55C7.721 15.216 8.768 16 10 16s2.279-.784 2.979-1.95a1 1 0 10-1.715-1.029C10.792 13.807 10.304 14 10 14s-.792-.193-1.264-.979a4.265 4.265 0 01-.264-.521H10a1 1 0 100-2H8.472a7.396 7.396 0 010-1H10a1 1 0 100-2H8.472c.08-.185.167-.36.264-.521z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold">{user.coins}</span>
          </div>
        )}

        {/* Energy Display */}
        {user && (
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${
            currentEnergy === 0 
              ? 'bg-red-100 text-red-800 border-red-300' 
              : isAtMax 
                ? 'bg-green-100 text-green-800 border-green-300'
                : 'bg-blue-100 text-blue-800 border-blue-300'
          }`}>
            <div className="flex items-center gap-1">
              <span className="text-lg">⚡</span>
              <span className="font-semibold">
                {currentEnergy ?? '?'}/{maxEnergy ?? '?'}
              </span>
            </div>
            {!isAtMax && minutesUntilNext > 0 && (
              <span className="text-xs opacity-75">
                +1 in {minutesUntilNext}m
              </span>
            )}
            {error && (
              <span className="text-xs text-red-600" title={error}>
                ❌
              </span>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default TopHeader;