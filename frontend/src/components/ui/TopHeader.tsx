import React from 'react';
import { useNotchDetection } from '../../hooks/useNotchDetection';
import { useAuthStore } from '../../stores/authStore';

const TopHeader: React.FC = () => {
  const { hasNotch, safeAreaTop } = useNotchDetection();
  const { user } = useAuthStore();
  
  return (
    <header 
      className="bg-white text-gray-500 shadow-lg"
      style={{
        paddingTop: hasNotch ? `${safeAreaTop}px` : '0px'
      }}
    >
      <div className="px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold">Clangen</h1>
        
        {user && (
          <div className="flex items-center gap-2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full border border-yellow-300">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.736 6.979C9.208 6.193 9.696 6 10 6s.792.193 1.264.979a1 1 0 001.715-1.029C12.279 4.784 11.232 4 10 4s-2.279.784-2.979 1.95c-.285.475-.507 1-.67 1.55H6a1 1 0 000 2h.013a9.358 9.358 0 000 1H6a1 1 0 100 2h.351c.163.55.385 1.075.67 1.55C7.721 15.216 8.768 16 10 16s2.279-.784 2.979-1.95a1 1 0 10-1.715-1.029C10.792 13.807 10.304 14 10 14s-.792-.193-1.264-.979a4.265 4.265 0 01-.264-.521H10a1 1 0 100-2H8.472a7.396 7.396 0 010-1H10a1 1 0 100-2H8.472c.08-.185.167-.36.264-.521z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold">{user.coins}</span>
          </div>
        )}
      </div>
    </header>
  );
};

export default TopHeader;