import React from 'react';

interface ErrorDisplayProps {
  error: string | null;
  onDismiss?: () => void;
  className?: string;
}

/**
 * Reusable error display component with optional dismiss functionality
 */
const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  error, 
  onDismiss, 
  className = "absolute top-16 left-1/2 transform -translate-x-1/2 z-10" 
}) => {
  if (!error) {
    return null;
  }

  return (
    <div className={className}>
      <div className="bg-red-900/80 backdrop-blur-sm rounded-lg p-3 text-white text-sm max-w-sm">
        <div className="flex items-center justify-between">
          <span>{error}</span>
          {onDismiss && (
            <button 
              onClick={onDismiss} 
              className="ml-2 text-red-300 hover:text-white"
            >
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;