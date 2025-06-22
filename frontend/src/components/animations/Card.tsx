import React, { useRef, useEffect } from 'react';
import { Group, Rect, Text } from 'react-konva';
import Konva from 'konva';

export interface CardData {
  id: string;
  value: string;
  suit?: string;
  faceUp?: boolean;
  orientation?: 'upright' | 'reversed';
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
  isFlipping?: boolean;
  onFlipComplete?: () => void;
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
  animationDuration = 800,
  isFlipping = false,
  onFlipComplete
}) => {
  const groupRef = useRef<Konva.Group>(null);
  const isFirstRender = useRef(true);
  const [localFaceUp, setLocalFaceUp] = React.useState(data.faceUp || false);

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

  // Handle flip animation
  useEffect(() => {
    if (isFlipping && groupRef.current) {
      const group = groupRef.current;
      
      // First half of flip - scale down to 0
      const flipOut = new Konva.Tween({
        node: group,
        duration: 0.3,
        scaleX: 0,
        easing: Konva.Easings.EaseInOut,
        onFinish: () => {
          // Change face at midpoint
          setLocalFaceUp(!localFaceUp);
          
          // Second half of flip - scale back to normal
          const flipIn = new Konva.Tween({
            node: group,
            duration: 0.3,
            scaleX: scale,
            easing: Konva.Easings.EaseInOut,
            onFinish: () => {
              onFlipComplete?.();
            }
          });
          flipIn.play();
        }
      });
      
      flipOut.play();
    }
  }, [isFlipping]);

  // Update local face up state when data changes
  useEffect(() => {
    setLocalFaceUp(data.faceUp || false);
  }, [data.faceUp]);

  // Card colors
  const cardBg = localFaceUp ? '#ffffff' : '#2D4A5D';
  const cardBorder = '#1a1a1a';
  const textColor = localFaceUp ? '#000000' : '#ffffff';
  
  // Check if this is a tarot card
  const isTarotCard = data.value && [
    'The Fool', 'The Magician', 'The High Priestess', 'The Empress', 'The Emperor',
    'The Hierophant', 'The Lovers', 'The Chariot', 'Strength', 'The Hermit',
    'Wheel of Fortune', 'Justice', 'The Hanged Man', 'Death', 'Temperance',
    'The Devil', 'The Tower', 'The Star', 'The Moon', 'The Sun',
    'Judgement', 'The World'
  ].includes(data.value);

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
      {localFaceUp ? (
        <>
          {isTarotCard ? (
            <>
              {/* Tarot card face up */}
              <Rect
                x={2}
                y={2}
                width={width - 4}
                height={height - 4}
                fill="#4a1d8a"
                stroke="#FFD700"
                strokeWidth={1}
                cornerRadius={cornerRadius - 1}
              />
              <Text
                x={width / 2}
                y={15}
                text={data.value || 'Tarot Card'}
                fontSize={Math.min(9, width * 0.12)}
                fontFamily="Arial"
                fill="#FFD700"
                fontStyle="bold"
                align="center"
                offsetX={(width / 2) - 10}
                wrap="word"
                width={width - 20}
              />
              {data.orientation && (
                <Text
                  x={width / 2}
                  y={height - 15}
                  text={data.orientation === 'upright' ? '↑' : '↓'}
                  fontSize={Math.min(16, width * 0.25)}
                  fontFamily="Arial"
                  fill={data.orientation === 'upright' ? '#90EE90' : '#FFB6C1'}
                  offsetX={8}
                  align="center"
                />
              )}
              <Text
                x={width / 2}
                y={height / 2}
                text="✦"
                fontSize={Math.min(20, width * 0.3)}
                fontFamily="Arial"
                fill="#FFD700"
                offsetX={10}
                offsetY={10}
                align="center"
                opacity={0.3}
              />
            </>
          ) : (
            <>
              {/* Regular playing card or expedition card face up */}
              <Rect
                x={2}
                y={2}
                width={width - 4}
                height={height - 4}
                fill="#4a1d8a"
                stroke="#FFD700"
                strokeWidth={1}
                cornerRadius={cornerRadius - 1}
              />
              <Text
                x={width / 2}
                y={15}
                text={data.value || 'Card'}
                fontSize={Math.min(9, width * 0.12)}
                fontFamily="Arial"
                fill="#FFD700"
                fontStyle="bold"
                align="center"
                offsetX={(width / 2) - 10}
                wrap="word"
                width={width - 20}
              />
              {data.orientation && (
                <Text
                  x={width / 2}
                  y={height - 15}
                  text={data.orientation === 'upright' ? '↑' : '↓'}
                  fontSize={Math.min(16, width * 0.25)}
                  fontFamily="Arial"
                  fill={data.orientation === 'upright' ? '#90EE90' : '#FFB6C1'}
                  offsetX={8}
                  align="center"
                />
              )}
              <Text
                x={width / 2}
                y={height / 2}
                text="✦"
                fontSize={Math.min(20, width * 0.3)}
                fontFamily="Arial"
                fill="#FFD700"
                offsetX={10}
                offsetY={10}
                align="center"
                opacity={0.3}
              />
            </>
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