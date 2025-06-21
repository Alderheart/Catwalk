import React, { useRef, useState } from 'react';
import CardCanvas from './CardCanvas';
import CardDeck, { CardDeckHandle } from './CardDeck';
import { CardData } from './Card';

/**
 * Demo component for the card streaming animation
 * Shows cards flowing from a deck to a target location
 */
const CardStreamDemo: React.FC = () => {
  const deckRef = useRef<CardDeckHandle>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  // Create a smaller deck for demonstration
  const cards: CardData[] = Array.from({ length: 8 }, (_, i) => ({
    id: `card-${i}`,
    value: ['A', '2', '3', '4', '5', '6', '7', '8'][i],
    suit: ['♠', '♥', '♦', '♣'][i % 4],
    faceUp: false
  }));

  const handleStreamCards = () => {
    if (isStreaming) return;
    
    setIsStreaming(true);
    
    // Stream to upper right area (like cards flying to hand)
    deckRef.current?.streamTo(600, 150, () => {
      setIsStreaming(false);
      
      // After a delay, collect cards back to deck
      setTimeout(() => {
        deckRef.current?.collect();
      }, 2000);
    });
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-green-900 to-green-950 relative">
      <CardCanvas className="w-full h-full">
        <CardDeck
          ref={deckRef}
          cards={cards}
          deckX={200}  // Deck on the left
          deckY={400}  // Lower on screen (like on a table)
        />
      </CardCanvas>

      {/* UI Controls */}
      <div className="absolute top-4 left-4 space-y-4">
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4 text-white">
          <h3 className="font-bold mb-2">Card Streaming Demo</h3>
          <p className="text-sm text-gray-300 mb-4">
            Click to see cards stream from deck to hand
          </p>
          <button
            onClick={handleStreamCards}
            disabled={isStreaming}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
          >
            {isStreaming ? 'Streaming...' : 'Draw Cards'}
          </button>
        </div>
      </div>

      {/* Visual indicators */}
      <div className="absolute bottom-4 left-4">
        <div className="bg-yellow-500/20 border-2 border-yellow-500 rounded-lg p-2 text-white text-sm">
          📚 Deck Location
        </div>
      </div>
      
      <div className="absolute top-4 right-4">
        <div className="bg-blue-500/20 border-2 border-blue-500 rounded-lg p-2 text-white text-sm">
          ✋ Hand Location
        </div>
      </div>
    </div>
  );
};

export default CardStreamDemo;