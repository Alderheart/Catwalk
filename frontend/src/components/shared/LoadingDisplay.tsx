import React from 'react';

interface LoadingDisplayProps {
  isLoading: boolean;
  message?: string;
  className?: string;
}

/**
 * Reusable loading display component with spinner and optional message
 */
const LoadingDisplay: React.FC<LoadingDisplayProps> = ({ 
  isLoading, 
  message = "Loading...",
  className = "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" 
}) => {
  if (!isLoading) {
    return null;
  }

  return (
    <div className={className}>
      <div className="bg-black/80 backdrop-blur-sm rounded-lg p-6 text-white text-center">
        <p className="text-lg">{message}</p>
      </div>
    </div>
  );
};

export default LoadingDisplay;