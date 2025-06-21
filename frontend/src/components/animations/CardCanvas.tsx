import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer } from 'react-konva';
import Konva from 'konva';

interface CardCanvasProps {
  width?: number;
  height?: number;
  className?: string;
}

/**
 * Canvas wrapper component for Konva-based animations
 * Handles responsive sizing and stage management
 */
const CardCanvas: React.FC<React.PropsWithChildren<CardCanvasProps>> = ({ 
  width: fixedWidth,
  height: fixedHeight,
  className = '',
  children 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: fixedWidth || width,
          height: fixedHeight || height
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, [fixedWidth, fixedHeight]);

  // Global Konva configuration for better performance
  useEffect(() => {
    Konva.pixelRatio = 1; // Disable pixel ratio scaling for performance
  }, []);

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full h-full ${className}`}
    >
      <Stage 
        width={dimensions.width} 
        height={dimensions.height}
      >
        <Layer>
          {children}
        </Layer>
      </Stage>
    </div>
  );
};

export default CardCanvas;