import React, { useState, useEffect, useRef } from 'react';

interface UprightMinigameProps {
  cardName: string;
  orientation: string;
  onComplete: (score: number, minigameType: string) => void;
}

interface GameState {
  phase: 'intro' | 'leaves-opening' | 'hunting' | 'pouncing' | 'result';
  distance: number; // 0 (far) to 100 (close)
  preyState: 'unaware' | 'alert' | 'aware';
  isAdvancing: boolean;
  canPounce: boolean;
  gameResult: 'success' | 'failure' | null;
  score: number;
}

const HermitUprightMinigame: React.FC<UprightMinigameProps> = ({ onComplete }) => {
  const [gameState, setGameState] = useState<GameState>({
    phase: 'intro',
    distance: 0,
    preyState: 'aware', // Start as red/aware
    isAdvancing: false,
    canPounce: false,
    gameResult: null,
    score: 0
  });

  const preyAwarenessTimerRef = useRef<number | null>(null);
  const gameLoopRef = useRef<number>();
  const isGameActiveRef = useRef(false);

  // Start the game sequence
  const startGame = () => {
    setGameState(prev => ({ ...prev, phase: 'leaves-opening' }));
    
    // After leaves animation, start hunting
    setTimeout(() => {
      setGameState(prev => ({ ...prev, phase: 'hunting' }));
      isGameActiveRef.current = true;
      // Don't call startSinglePreyTimer here - let useEffect handle it
    }, 4500); // Wait for 4s animation + 0.5s buffer
  };

  // Single timer approach - no recursion
  const startSinglePreyTimer = () => {
    if (!isGameActiveRef.current) return;
    
    // Clear any existing timer
    if (preyAwarenessTimerRef.current) {
      clearTimeout(preyAwarenessTimerRef.current);
      preyAwarenessTimerRef.current = null;
    }
    
    // Get current state
    const currentState = gameState.preyState;
    let nextState: 'unaware' | 'alert' | 'aware';
    let duration: number;
    
    // Determine next state and duration
    if (currentState === 'unaware') {
      nextState = 'alert';
      duration = Math.random() * 2500 + 500; // 0.5-3s (green)
    } else if (currentState === 'alert') {
      nextState = 'aware';
      duration = Math.random() * 500 + 200; // 0.2-0.7s (yellow)
    } else { // aware
      nextState = 'unaware';
      duration = Math.random() * 2000 + 2000; // 2-4s (red - keeping same)
    }
    
    console.log(`Timer: ${currentState} -> ${nextState} in ${duration}ms`);
    
    // Set single timer
    preyAwarenessTimerRef.current = window.setTimeout(() => {
      if (!isGameActiveRef.current) return;
      
      console.log(`Transitioning to: ${nextState}`);
      setGameState(prev => ({ ...prev, preyState: nextState }));
    }, duration);
  };
  
  // React to prey state changes
  useEffect(() => {
    if (gameState.phase === 'hunting' && isGameActiveRef.current) {
      console.log('useEffect triggered - starting timer for state:', gameState.preyState);
      startSinglePreyTimer();
    }
    
    return () => {
      if (preyAwarenessTimerRef.current) {
        clearTimeout(preyAwarenessTimerRef.current);
        preyAwarenessTimerRef.current = null;
      }
    };
  }, [gameState.preyState, gameState.phase]);


  // Handle mouse/touch down
  const handleAdvanceStart = () => {
    if (gameState.phase !== 'hunting') return;
    setGameState(prev => ({ ...prev, isAdvancing: true }));
  };

  // Handle mouse/touch up
  const handleAdvanceStop = () => {
    setGameState(prev => ({ ...prev, isAdvancing: false }));
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
      gameLoopRef.current = undefined;
    }
  };


  // Handle pounce
  const handlePounce = () => {
    if (!gameState.canPounce || gameState.phase !== 'hunting') return;
    
    console.log('POUNCE: Player pounced at distance', gameState.distance);
    isGameActiveRef.current = false;
    if (preyAwarenessTimerRef.current) {
      clearTimeout(preyAwarenessTimerRef.current);
      preyAwarenessTimerRef.current = null;
    }
    
    setGameState(prev => ({ ...prev, phase: 'pouncing' }));
    
    // Calculate success based on distance (closer = higher chance)
    const successChance = (gameState.distance - 60) / 40; // 0% at 60%, 100% at 100%
    const isSuccess = Math.random() < successChance;
    
    const score = isSuccess 
      ? Math.floor(60 + (gameState.distance - 60) * 1.0) // 60-100 points based on final distance
      : Math.floor(gameState.distance * 0.5); // Half credit for failed pounce
    
    setTimeout(() => {
      console.log('POUNCE RESULT:', isSuccess ? 'success' : 'failure', 'Score:', score);
      setGameState(prev => ({
        ...prev,
        phase: 'result',
        gameResult: isSuccess ? 'success' : 'failure',
        score
      }));
    }, 1500);
  };

  // Complete game
  useEffect(() => {
    if (gameState.phase === 'result') {
      console.log('RESULT PHASE: Auto-closing minigame in 2 seconds with score:', gameState.score);
      setTimeout(() => {
        console.log('AUTO-CLOSE: Calling onComplete');
        onComplete(gameState.score, 'hermit-prey-hunt');
      }, 2000);
    }
  }, [gameState.phase, gameState.score, onComplete]);

  // Handle advancement loop
  useEffect(() => {
    let animationId: number;
    
    if (gameState.isAdvancing && gameState.phase === 'hunting') {
      const advance = () => {
        setGameState(prev => {
          if (!prev.isAdvancing || prev.phase !== 'hunting') {
            return prev;
          }
          
          // Check if caught while advancing during aware state (instant fail)
          if (prev.preyState === 'aware') {
            console.log('GAME END: Caught advancing during aware state');
            isGameActiveRef.current = false;
            if (preyAwarenessTimerRef.current) {
              clearTimeout(preyAwarenessTimerRef.current);
              preyAwarenessTimerRef.current = null;
            }
            return {
              ...prev,
              phase: 'result',
              gameResult: 'failure',
              isAdvancing: false,
              score: Math.floor(prev.distance * 0.3)
            };
          }
          
          const newDistance = Math.min(100, prev.distance + 0.1008); // 30% slower from previous (0.144 * 0.7)
          const canPounce = newDistance >= 60;
          
          // Auto-fail if reaching 100% without pouncing
          if (newDistance >= 100) {
            console.log('GAME END: Reached 100% distance without pouncing');
            isGameActiveRef.current = false;
            if (preyAwarenessTimerRef.current) {
              clearTimeout(preyAwarenessTimerRef.current);
              preyAwarenessTimerRef.current = null;
            }
            return {
              ...prev,
              phase: 'result',
              gameResult: 'failure',
              isAdvancing: false,
              score: Math.floor(prev.distance * 0.2) // Lower score for getting too close
            };
          }
          
          return {
            ...prev,
            distance: newDistance,
            canPounce
          };
        });
        
        // Continue the loop
        animationId = requestAnimationFrame(advance);
      };
      
      animationId = requestAnimationFrame(advance);
    }
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [gameState.isAdvancing, gameState.phase]);

  // Cleanup
  useEffect(() => {
    return () => {
      isGameActiveRef.current = false;
      if (preyAwarenessTimerRef.current) {
        clearTimeout(preyAwarenessTimerRef.current);
        preyAwarenessTimerRef.current = null;
      }
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, []);

  if (gameState.phase === 'intro') {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-green-800 to-green-900 text-white p-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">The Hunt Begins</h2>
          <p className="text-lg mb-4">
            Stalk your prey through the undergrowth. Advance when unaware, freeze when alert.
          </p>
          <p className="text-sm opacity-80 mb-4">
            Hold to advance, release to stop. Wait for the right moment to pounce.
          </p>
        </div>
        
        <button
          onClick={startGame}
          className="px-8 py-3 bg-amber-600 hover:bg-amber-700 rounded-lg font-semibold transition-colors"
        >
          Begin the Hunt
        </button>
      </div>
    );
  }

  if (gameState.phase === 'leaves-opening') {
    return (
      <div className="relative h-full bg-gradient-to-b from-green-800 to-green-900 overflow-hidden">
        {/* Left leaf - starts covering left half, slides left to reveal */}
        <div 
          className="absolute top-0 left-0 w-1/2 h-full bg-green-600 z-10"
          style={{ 
            animation: 'slideLeft 4s ease-out forwards'
          }}
        >
          <div className="w-full h-full bg-green-700"></div>
        </div>
        
        {/* Right leaf - starts covering right half, slides right to reveal */}
        <div 
          className="absolute top-0 right-0 w-1/2 h-full bg-green-600 z-10"
          style={{ 
            animation: 'slideRight 4s ease-out forwards'
          }}
        >
          <div className="w-full h-full bg-green-700"></div>
        </div>
        
        {/* Revealed scene behind */}
        <div className="flex items-center justify-center h-full">
          <div className="text-white text-center">
            <p className="text-lg">Leaves part to reveal...</p>
          </div>
        </div>
        
        {/* CSS for leaf animations */}
        <style>{`
          @keyframes slideLeft {
            from { transform: translateX(0); }
            to { transform: translateX(-100%); }
          }
          @keyframes slideRight {
            from { transform: translateX(0); }
            to { transform: translateX(100%); }
          }
        `}</style>
      </div>
    );
  }

  if (gameState.phase === 'result') {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-green-800 to-green-900 text-white p-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">
            {gameState.gameResult === 'success' ? 'Successful Hunt!' : 'Hunt Failed'}
          </h2>
          <p className="text-xl mb-4">Score: {gameState.score}/100</p>
          <p className="text-lg">
            {gameState.gameResult === 'success' 
              ? "Your patience and timing have served you well!"
              : gameState.score > 30 
                ? "A valiant effort, but the prey escaped."
                : "The hunt requires more patience and stealth."
            }
          </p>
        </div>
      </div>
    );
  }

  // Main hunting phase - ensure zoom matches distance precisely
  const preyScale = 1 + (gameState.distance / 100) * 2; // Scale from 1x to 3x
  
  return (
    <div className="relative h-full bg-gradient-to-b from-green-800 to-green-900 overflow-hidden">
      {/* UI Elements */}
      <div className="absolute top-4 left-4 right-4 flex justify-between text-white z-10">
        <div className="bg-black/50 px-3 py-1 rounded">
          Distance: {Math.floor(gameState.distance)}% {gameState.canPounce ? '(Can Pounce!)' : ''}
        </div>
        <div className={`px-3 py-1 rounded ${
          gameState.preyState === 'aware' ? 'bg-red-600' : 
          gameState.preyState === 'alert' ? 'bg-yellow-600' : 'bg-green-600'
        }`}>
          Prey: {gameState.preyState === 'aware' ? 'AWARE' : 
                gameState.preyState === 'alert' ? 'ALERT' : 'Unaware'}
        </div>
      </div>

      {/* Hunting Ground */}
      <div 
        className="absolute inset-0 select-none"
        onMouseDown={handleAdvanceStart}
        onMouseUp={handleAdvanceStop}
        onMouseLeave={handleAdvanceStop}
        onTouchStart={handleAdvanceStart}
        onTouchEnd={handleAdvanceStop}
      >
        {/* Prey in center */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div 
            className={`w-16 h-12 rounded transition-none ${
              gameState.preyState === 'aware' ? 'bg-red-400' : 
              gameState.preyState === 'alert' ? 'bg-yellow-400' : 'bg-green-400'
            }`}
            style={{ 
              transform: `scale(${preyScale})`,
              transformOrigin: 'center'
            }}
          >
            <div className="w-full h-full flex items-center justify-center text-black font-bold">
              PREY
            </div>
          </div>
        </div>


      </div>

      {/* Advancing indicator */}
      {gameState.isAdvancing && (
        <div className="absolute top-1/2 left-4 text-white bg-black/50 px-2 py-1 rounded">
          Advancing...
        </div>
      )}

      {/* Pounce button - OUTSIDE hunting ground to prevent advancement trigger */}
      {gameState.canPounce && gameState.phase === 'hunting' && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30">
          <button
            onClick={handlePounce}
            className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xl rounded-lg transition-colors animate-pulse shadow-lg border-2 border-red-400"
          >
            POUNCE!
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 text-white text-sm bg-black/50 px-2 py-1 rounded">
        Hold to advance • Release to stop
      </div>
    </div>
  );
};

export default HermitUprightMinigame;