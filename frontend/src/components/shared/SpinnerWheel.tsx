import React, { useState, useRef } from 'react';

export interface SpinnerSection {
  id: string;
  label: string;
  color: string;
  probability?: number;
}

interface SpinnerWheelProps {
  sections: SpinnerSection[];
  size?: number;
  onSpinComplete?: (result: SpinnerSection) => void;
  disabled?: boolean;
  className?: string;
}

const SpinnerWheel: React.FC<SpinnerWheelProps> = ({
  sections,
  size = 300,
  onSpinComplete,
  disabled = false,
  className = ''
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [pointerRotation, setPointerRotation] = useState(0);
  const pointerRef = useRef<HTMLDivElement>(null);

  const totalSections = sections.length;
  const sectionAngle = 360 / totalSections;
  const radius = size / 2;
  const center = radius;

  // Determine random result using proper randomization with probability support
  const determineRandomResult = (): SpinnerSection => {
    // Check if any sections have probabilities defined
    const hasProbabilities = sections.some(section => section.probability !== undefined);
    
    if (hasProbabilities) {
      // Use weighted random selection
      const totalWeight = sections.reduce((sum, section) => sum + (section.probability || 1), 0);
      let random = Math.random() * totalWeight;
      
      for (const section of sections) {
        random -= (section.probability || 1);
        if (random <= 0) {
          return section;
        }
      }
      // Fallback to last section (shouldn't happen)
      return sections[sections.length - 1];
    } else {
      // Equal probability for all sections
      const randomIndex = Math.floor(Math.random() * sections.length);
      return sections[randomIndex];
    }
  };

  // Calculate the target angle for the pointer to land on a specific section
  const calculateTargetPointerAngle = (targetSection: SpinnerSection): number => {
    const sectionIndex = sections.findIndex(section => section.id === targetSection.id);
    if (sectionIndex === -1) return 0;

    // The pointer points up (0 degrees) and sections are arranged starting from top going clockwise
    // We need to calculate which section the pointer should point to
    
    // Section 0 starts at the top (where pointer naturally points)
    // Section angles: 0 to sectionAngle, sectionAngle to 2*sectionAngle, etc.
    const sectionStartAngle = sectionIndex * sectionAngle;
    
    // Add randomness within the section (but ensure it lands in the right section)  
    const randomOffset = Math.random() * sectionAngle * 0.8 + sectionAngle * 0.1; // 10-90% within section
    const targetAngle = sectionStartAngle + randomOffset;
    
    return targetAngle;
  };

  const spin = () => {
    if (isSpinning || disabled) return;

    setIsSpinning(true);

    // 1. First determine the result using proper randomization
    const resultSection = determineRandomResult();

    // 2. Calculate target pointer angle to land on that section
    const targetAngle = calculateTargetPointerAngle(resultSection);

    // 3. Add multiple full rotations for dramatic effect
    const minSpins = 4;
    const maxSpins = 8;
    const spins = Math.random() * (maxSpins - minSpins) + minSpins;
    const totalRotation = pointerRotation + (spins * 360) + targetAngle;

    setPointerRotation(totalRotation);

    // Complete the spin after animation
    setTimeout(() => {
      setIsSpinning(false);
      if (onSpinComplete) {
        onSpinComplete(resultSection);
      }
    }, 4000);
  };

  const createSectionPath = (index: number) => {
    // Start from top (270 degrees in standard coordinates, but we want 0 at top)
    const startAngle = index * sectionAngle - 90; // Offset by -90 to start at top
    const endAngle = (index + 1) * sectionAngle - 90;
    
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;
    
    const x1 = center + radius * Math.cos(startAngleRad);
    const y1 = center + radius * Math.sin(startAngleRad);
    const x2 = center + radius * Math.cos(endAngleRad);
    const y2 = center + radius * Math.sin(endAngleRad);
    
    const largeArcFlag = sectionAngle > 180 ? 1 : 0;
    
    return `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  const getLabelPosition = (index: number) => {
    // Match the section positioning - start from top
    const angle = (index * sectionAngle) + (sectionAngle / 2) - 90;
    const angleRad = (angle * Math.PI) / 180;
    const labelRadius = radius * 0.7;
    
    const x = center + labelRadius * Math.cos(angleRad);
    const y = center + labelRadius * Math.sin(angleRad);
    
    return { x, y };
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        {/* Fixed Wheel */}
        <div
          className={`relative rounded-full border-4 border-gray-800 ${
            disabled ? 'opacity-50' : 'cursor-pointer'
          }`}
          style={{
            width: size,
            height: size,
          }}
          onClick={spin}
        >
          <svg
            width={size}
            height={size}
            className="absolute top-0 left-0"
            viewBox={`0 0 ${size} ${size}`}
          >
            {sections.map((section, index) => (
              <g key={section.id}>
                {/* Section */}
                <path
                  d={createSectionPath(index)}
                  fill={section.color}
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                
                {/* Label */}
                <text
                  x={getLabelPosition(index).x}
                  y={getLabelPosition(index).y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#ffffff"
                  fontSize={Math.min(14, size / 20)}
                  fontWeight="bold"
                  style={{
                    textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                    pointerEvents: 'none'
                  }}
                >
                  {section.label}
                </text>
              </g>
            ))}
          </svg>
        </div>
        
        {/* Spinning Pointer - SVG for precise positioning */}
        <div 
          className="absolute inset-0 transition-transform duration-[4000ms] z-10"
          style={{
            transform: `rotate(${pointerRotation}deg)`,
            transformOrigin: 'center center',
            transitionTimingFunction: isSpinning 
              ? 'cubic-bezier(0.17, 0.67, 0.12, 0.99)' 
              : 'ease-out'
          }}
        >
          <svg
            width={size}
            height={size}
            className="absolute top-0 left-0"
            viewBox={`0 0 ${size} ${size}`}
          >
            {/* Pointer line pointing upward (12 o'clock) */}
            <line
              x1={center}
              y1={center}
              x2={center}
              y2={25}
              stroke="#dc2626"
              strokeWidth="4"
              strokeLinecap="round"
            />
            
            {/* Pointer tip */}
            <circle
              cx={center}
              cy={20}
              r="8"
              fill="#dc2626"
            />
            
            {/* Center circle */}
            <circle
              cx={center}
              cy={center}
              r="12"
              fill="#1f2937"
              stroke="#ffffff"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>
      
      {/* Spin Button */}
      <button
        onClick={spin}
        disabled={isSpinning || disabled}
        className={`mt-4 px-6 py-2 rounded-lg font-bold text-white transition-colors ${
          isSpinning || disabled
            ? 'bg-gray-500 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
        }`}
      >
        {isSpinning ? 'Spinning...' : 'Spin!'}
      </button>
    </div>
  );
};

export default SpinnerWheel;