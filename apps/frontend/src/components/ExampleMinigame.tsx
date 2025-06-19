import React, { useEffect } from 'react'
import { useTabBarStore } from '../stores/tabBarStore'

/**
 * Example component showing how to hide the tab bar during minigames
 */
const ExampleMinigame: React.FC = () => {
  const { hideForMinigame, showAfterMinigame } = useTabBarStore()
  
  useEffect(() => {
    // Hide tab bar when minigame starts
    hideForMinigame()
    
    // Show tab bar when component unmounts (minigame ends)
    return () => {
      showAfterMinigame()
    }
  }, [hideForMinigame, showAfterMinigame])
  
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white text-center">
        <h1 className="text-2xl mb-4">Minigame Example</h1>
        <p className="mb-4">The tab bar is hidden during minigames</p>
        <button 
          onClick={showAfterMinigame}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Exit Minigame
        </button>
      </div>
    </div>
  )
}

export default ExampleMinigame