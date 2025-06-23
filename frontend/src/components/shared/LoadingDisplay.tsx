import React from 'react';

interface LoadingDisplayProps {
  isLoading: boolean;
  message?: string;
  variant?: 'camp' | 'cats' | 'app' | 'overlay';
  className?: string;
}

/**
 * Unified loading display component with spinner and configurable styling
 */
const LoadingDisplay: React.FC<LoadingDisplayProps> = ({ 
  isLoading, 
  message = "Loading...",
  variant = 'camp',
  className 
}) => {
  if (!isLoading) {
    return null;
  }

  const getVariantStyles = () => {
    switch (variant) {
      case 'camp':
        return {
          container: "h-full w-full overflow-hidden bg-gradient-to-b from-green-900 to-green-950 safe-area-all flex items-center justify-center",
          message: message === "Loading..." ? "Loading camp..." : message
        };
      case 'cats':
        return {
          container: "h-full w-full overflow-hidden bg-gradient-to-b from-blue-900 to-blue-950 safe-area-all flex items-center justify-center",
          message: message === "Loading..." ? "Loading your cats..." : message
        };
      case 'app':
        return {
          container: "h-full w-full flex items-center justify-center bg-gray-900",
          message
        };
      case 'overlay':
        return {
          container: "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
          message
        };
      default:
        return {
          container: "h-full w-full overflow-hidden bg-gradient-to-b from-green-900 to-green-950 safe-area-all flex items-center justify-center",
          message
        };
    }
  };

  const { container, message: displayMessage } = getVariantStyles();
  const finalClassName = className || container;

  return (
    <div className={finalClassName}>
      {variant === 'overlay' ? (
        <div className="bg-black/80 backdrop-blur-sm rounded-lg p-6 text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">{displayMessage}</p>
        </div>
      ) : (
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">{displayMessage}</p>
        </div>
      )}
    </div>
  );
};

export default LoadingDisplay;