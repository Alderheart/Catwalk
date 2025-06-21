import React, { useRef, useEffect } from 'react';
import { Group, Rect, Text } from 'react-konva';
import Konva from 'konva';

export interface CardData {
  id: string;
  value: string;
  suit?: string;
  faceUp?: boolean;
}

interface CardProps {
  x: number;
  y: number;
  width?: number;
  height?: number;
  data: CardData;
  rotation?: number;
  scale?: number;
  opacity?: number;
  cornerRadius?: number;
  animationDuration?: number;
}

/**
 * Individual playing card component
 * Renders with customizable position, rotation, and appearance
 */
const Card: React.FC<CardProps> = ({
  x,
  y,
  width = 70,
  height = 100,
  data,
  rotation = 0,
  scale = 1,
  opacity = 1,
  cornerRadius = 8,
  animationDuration = 800
}) => {
  const groupRef = useRef<Konva.Group>(null);
  const isFirstRender = useRef(true);

  // Animate to new position when props change
  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    // Skip animation on first render - set position immediately
    if (isFirstRender.current) {
      group.setAttrs({
        x: x,
        y: y,
        rotation: rotation,
        scaleX: scale,
        scaleY: scale,
        opacity: opacity,
      });
      isFirstRender.current = false;
      return;
    }

    // Use Konva Tween for smooth animation on subsequent changes
    const tween = new Konva.Tween({
      node: group,
      duration: animationDuration / 1000, // Convert to seconds
      x: x,
      y: y,
      rotation: rotation,
      scaleX: scale,
      scaleY: scale,
      opacity: opacity,
      easing: Konva.Easings.EaseOut
    });

    tween.play();

    return () => {
      tween.destroy();
    };
  }, [x, y, rotation, scale, opacity, animationDuration]);

  // Card colors
  const cardBg = data.faceUp ? '#ffffff' : '#2D4A5D';
  const cardBorder = '#1a1a1a';
  const textColor = data.faceUp ? '#000000' : '#ffffff';

  return (
    <Group
      ref={groupRef}
      offsetX={width / 2}
      offsetY={height / 2}
    >
      {/* Card background */}
      <Rect
        width={width}
        height={height}
        fill={cardBg}
        stroke={cardBorder}
        strokeWidth={2}
        cornerRadius={cornerRadius}
        shadowColor="rgba(0,0,0,0.3)"
        shadowBlur={5}
        shadowOffsetX={2}
        shadowOffsetY={2}
      />
      
      {/* Card content */}
      {data.faceUp ? (
        <>
          {/* Face up - show value */}
          <Text
            x={10}
            y={10}
            text={data.value}
            fontSize={16}
            fontFamily="Arial"
            fill={textColor}
            fontStyle="bold"
          />
          {data.suit && (
            <Text
              x={width / 2}
              y={height / 2}
              text={data.suit}
              fontSize={24}
              fontFamily="Arial"
              fill={textColor}
              offsetX={12}
              offsetY={12}
              align="center"
            />
          )}
        </>
      ) : (
        <>
          {/* Face down - decorative pattern */}
          <Rect
            x={5}
            y={5}
            width={width - 10}
            height={height - 10}
            fill="transparent"
            stroke="#4A6F8A"
            strokeWidth={1}
            cornerRadius={cornerRadius - 2}
          />
          <Text
            x={width / 2}
            y={height / 2}
            text="✦"
            fontSize={28}
            fontFamily="Arial"
            fill="#4A6F8A"
            offsetX={14}
            offsetY={14}
            align="center"
          />
        </>
      )}
    </Group>
  );
};

export default Card;