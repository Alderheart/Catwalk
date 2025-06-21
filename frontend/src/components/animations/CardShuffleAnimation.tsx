import React, { useState, useEffect, useRef } from 'react';
import CardCanvas from './CardCanvas';
import CardDeck, { CardDeckHandle } from './CardDeck';
import { CardData } from './Card';
import { Group } from 'react-konva';
import Konva from 'konva';

interface CardShuffleAnimationProps {
  autoPlay?: boolean;
  loop?: boolean;
  shuffleInterval?: number;
  cardCount?: number;
  className?: string;
}

/**
 * Complete card shuffle animation component
 * Manages the deck and triggers shuffle animations
 */
const CardShuffleAnimation: React.FC<CardShuffleAnimationProps> = ({
  autoPlay = true,
  loop = true,
  shuffleInterval = 4000,
  cardCount = 10,
  className = ''
}) => {
  const [cards, setCards] = useState<CardData[]>([]);
  const deckRef = useRef<CardDeckHandle>(null);

  // Initialize deck of cards
  useEffect(() => {
    const deck: CardData[] = [];
    const suits = ['♠', '♥', '♦', '♣'];
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    
    // Create a subset of cards based on cardCount
    for (let i = 0; i < cardCount; i++) {
      const suit = suits[i % suits.length];
      const value = values[i % values.length];
      
      deck.push({
        id: `card-${i}`,
        value: value,
        suit: suit,
        faceUp: false // Start face down
      });
    }
    
    setCards(deck);
  }, [cardCount]);

  // Auto-play shuffle animation
  useEffect(() => {
    if (!autoPlay) return;

    // Initial shuffle after a short delay
    const initialTimeout = setTimeout(() => {
      deckRef.current?.riffleShuffle();
    }, 1000);

    // Set up loop if enabled
    let intervalId: ReturnType<typeof setInterval> | undefined;
    if (loop) {
      intervalId = setInterval(() => {
        deckRef.current?.riffleShuffle();
      }, shuffleInterval);
    }

    return () => {
      clearTimeout(initialTimeout);
      if (intervalId) clearInterval(intervalId);
    };
  }, [autoPlay, loop, shuffleInterval]);

  // Smooth animation with Konva Tweens
  useEffect(() => {
    // Configure Konva for smooth animations
    Konva.pixelRatio = 1;
  }, []);

  return (
    <div className={`relative bg-gradient-to-br from-green-900 to-green-950 rounded-lg overflow-hidden ${className}`}>
      <CardCanvas>
        <Group>
          <CardDeck
            ref={deckRef}
            cards={cards}
            deckX={400}
            deckY={300}
            onShuffleComplete={() => {
              // Could trigger sound effects or other actions here
              console.log('Shuffle complete!');
            }}
          />
        </Group>
      </CardCanvas>
    </div>
  );
};

export default CardShuffleAnimation;