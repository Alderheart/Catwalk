import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import Card, { CardData } from './Card';

interface CardPosition {
  x: number;
  y: number;
  rotation: number;
  scale: number;
  opacity: number;
  animationDuration?: number;
}

interface CardDeckProps {
  cards: CardData[];
  deckX?: number;
  deckY?: number;
  spreadRadius?: number;
  onShuffleComplete?: () => void;
}

export interface CardDeckHandle {
  riffleShuffle: () => void;
  fanOut: () => void;
  collect: () => void;
  streamTo: (targetX: number, targetY: number, onComplete?: () => void) => void;
  reset: () => void;
}

/**
 * Manages a collection of cards and their animations
 * Handles shuffle animations and card positioning
 */
const CardDeck = forwardRef<CardDeckHandle, CardDeckProps>(({
  cards,
  deckX = 400,
  deckY = 300,
  spreadRadius = 150,
  onShuffleComplete
}, ref) => {
  const [cardPositions, setCardPositions] = useState<Record<string, CardPosition>>({});
  const [isShuffling, setIsShuffling] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const animationTimeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Reset function to reinitialize positions
  const reset = () => {
    setHasInitialized(false);
    setIsShuffling(false);
    animationTimeouts.current.forEach(timeout => clearTimeout(timeout));
    animationTimeouts.current = [];
  };

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    riffleShuffle,
    fanOut,
    collect,
    streamTo,
    reset
  }));

  // Initialize card positions only once
  useEffect(() => {
    if (!hasInitialized) {
      const initialPositions: Record<string, CardPosition> = {};
      cards.forEach((card, index) => {
        initialPositions[card.id] = {
          x: deckX,
          y: deckY - index * 0.5, // Stack cards slightly offset
          rotation: 0,
          scale: 1,
          opacity: 1,
          animationDuration: 0 // No animation for initial positioning
        };
      });
      setCardPositions(initialPositions);
      setHasInitialized(true);
    }
  }, [cards, deckX, deckY, hasInitialized]);

  // Clear timeouts on cleanup
  useEffect(() => {
    return () => {
      animationTimeouts.current.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  /**
   * Performs a riffle shuffle animation
   */
  const riffleShuffle = () => {
    if (isShuffling) return;
    
    setIsShuffling(true);
    animationTimeouts.current = [];

    const cardCount = cards.length;
    const halfPoint = Math.floor(cardCount / 2);
    
    // Phase 1: Split deck into two halves
    const splitPositions: Record<string, CardPosition> = {};
    
    cards.forEach((card, index) => {
      const isLeftPile = index < halfPoint;
      const pileIndex = isLeftPile ? index : index - halfPoint;
      
      splitPositions[card.id] = {
        x: deckX + (isLeftPile ? -100 : 100),
        y: deckY - pileIndex * 2,
        rotation: isLeftPile ? -15 : 15,
        scale: 1,
        opacity: 1
      };
    });

    // Animate split
    animateToPositions(splitPositions);

    // Phase 2: Interleave cards back together
    const timeout1 = setTimeout(() => {
      const shuffledOrder: CardData[] = [];

      // Riffle shuffle algorithm - interleave from both piles
      let leftIndex = 0;
      let rightIndex = halfPoint;

      while (leftIndex < halfPoint || rightIndex < cardCount) {
        // Randomly choose from left or right pile
        const useLeft = Math.random() > 0.5 && leftIndex < halfPoint || rightIndex >= cardCount;
        
        if (useLeft && leftIndex < halfPoint) {
          shuffledOrder.push(cards[leftIndex]);
          leftIndex++;
        } else if (rightIndex < cardCount) {
          shuffledOrder.push(cards[rightIndex]);
          rightIndex++;
        }
      }

      // Create animated positions for shuffled cards
      shuffledOrder.forEach((card, index) => {
        const staggerDelay = index * 50;
        
        const timeout = setTimeout(() => {
          setCardPositions(prev => ({
            ...prev,
            [card.id]: {
              x: deckX,
              y: deckY - index * 0.5,
              rotation: 0,
              scale: 1,
              opacity: 1
            }
          }));
        }, staggerDelay);
        
        animationTimeouts.current.push(timeout);
      });

      // Complete shuffle after all cards return
      const timeout2 = setTimeout(() => {
        setIsShuffling(false);
        onShuffleComplete?.();
      }, shuffledOrder.length * 50 + 500);
      
      animationTimeouts.current.push(timeout2);
    }, 500);

    animationTimeouts.current.push(timeout1);
  };

  /**
   * Fan out cards in an arc
   */
  const fanOut = () => {
    if (isShuffling) return;
    
    const fanPositions: Record<string, CardPosition> = {};
    const angleStep = 120 / cards.length; // 120 degree arc
    const startAngle = -60; // Start from -60 degrees

    cards.forEach((card, index) => {
      const angle = startAngle + angleStep * index;
      const radian = (angle * Math.PI) / 180;
      
      fanPositions[card.id] = {
        x: deckX + Math.cos(radian) * spreadRadius,
        y: deckY + Math.sin(radian) * spreadRadius * 0.5,
        rotation: angle,
        scale: 1,
        opacity: 1
      };
    });

    animateToPositions(fanPositions);
  };

  /**
   * Collect cards back to deck
   */
  const collect = () => {
    if (isShuffling) return;
    
    const collectPositions: Record<string, CardPosition> = {};
    
    cards.forEach((card, index) => {
      collectPositions[card.id] = {
        x: deckX,
        y: deckY - index * 0.5,
        rotation: 0,
        scale: 1,
        opacity: 1,
        animationDuration: 600
      };
    });

    animateToPositions(collectPositions);
  };

  /**
   * Stream cards from deck to target location with flowing motion
   */
  const streamTo = (targetX: number, targetY: number, onComplete?: () => void) => {
    if (isShuffling) return;
    
    setIsShuffling(true);
    animationTimeouts.current = [];

    // Create streaming animation for each card with staggered timing
    cards.forEach((card, index) => {
      const delay = index * 80; // 80ms between each card for faster streaming
      
      const timeout = setTimeout(() => {
        setCardPositions(prev => {
          // Stack cards neatly in a pile - no randomness
          const finalX = targetX;
          const finalY = targetY - index * 0.5; // Stack cards slightly offset like a neat pile
          
          return {
            ...prev,
            [card.id]: {
              x: finalX,
              y: finalY,
              rotation: 0, // No rotation - keep cards straight
              scale: 1,
              opacity: 1,
              animationDuration: 500 // Faster animation duration
            }
          };
        });
      }, delay);
      
      animationTimeouts.current.push(timeout);
    });

    // Call completion callback after all cards have moved
    const totalAnimationTime = cards.length * 80 + 600; // Stagger time + animation duration
    const completionTimeout = setTimeout(() => {
      setIsShuffling(false);
      onComplete?.();
    }, totalAnimationTime);
    
    animationTimeouts.current.push(completionTimeout);
  };

  /**
   * Helper to animate to new positions
   */
  const animateToPositions = (newPositions: Record<string, CardPosition>) => {
    // Using React state for simplicity, could use Konva Tween for smoother animation
    setCardPositions(newPositions);
  };

  return (
    <>
      {cards.map((card) => {
        const position = cardPositions[card.id] || { x: deckX, y: deckY, rotation: 0, scale: 1, opacity: 1, animationDuration: 0 };
        return (
          <Card
            key={card.id}
            x={position.x}
            y={position.y}
            rotation={position.rotation}
            scale={position.scale}
            opacity={position.opacity}
            animationDuration={position.animationDuration}
            data={card}
          />
        );
      })}
    </>
  );
});

CardDeck.displayName = 'CardDeck';

export default CardDeck;