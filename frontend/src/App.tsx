import { useEffect, useState } from 'react'
import Camp from './components/game/Camp'
import BottomTabBar from './components/ui/BottomTabBar'
import TopHeader from './components/ui/TopHeader'
import CatsList from './components/game/CatsList'
import AuthPage from './components/auth/AuthPage'
import MenuPage from './components/game/MenuPage'
import AdminPanel from './components/admin/AdminPanel'
import ExpeditionsPage from './components/game/expeditions/ExpeditionsPage'
import ExpeditionScreen from './components/game/expeditions/ExpeditionScreen'
import LifePage from './components/game/LifePage'
import LoadingDisplay from './components/shared/LoadingDisplay'
import { useTabBarStore } from './stores/tabBarStore'
import { useAuthStore } from './stores/authStore'

function App() {
  const { activeTab, showTabBar, setActiveTab } = useTabBarStore()
  const { isAuthenticated, isLoading, checkAuthStatus } = useAuthStore()
  const [expeditionScreenId, setExpeditionScreenId] = useState<string | null>(null)

  // Check auth status on app load
  useEffect(() => {
    checkAuthStatus()
  }, [checkAuthStatus])

  // Set default tab to camp when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setActiveTab('camp')
    }
  }, [isAuthenticated, setActiveTab])


  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
  }

  const handleEnterExpedition = (expeditionId: string) => {
    setExpeditionScreenId(expeditionId)
  }

  const handleExitExpedition = () => {
    setExpeditionScreenId(null)
    setActiveTab('expeditions')
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'camp':
        return <Camp />
      case 'cats':
        return <CatsList />
      case 'shop':
        return (
          <div className="h-full w-full overflow-hidden bg-gradient-to-b from-purple-900 to-purple-950 p-4 flex items-center justify-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center">Shop (Coming Soon)</h1>
          </div>
        )
      case 'expeditions':
        return <ExpeditionsPage onEnterExpedition={handleEnterExpedition} />
      case 'life':
        return <LifePage />
      case 'menu':
        return <MenuPage />
      case 'admin':
        return <AdminPanel />
      default:
        return <Camp />
    }
  }

  // Show loading or auth page if not authenticated
  if (isLoading) {
    return <LoadingDisplay isLoading={isLoading} variant="app" />;
  }

  if (!isAuthenticated) {
    return <AuthPage />
  }

  return (
    <div className="relative h-full w-full overflow-hidden flex flex-col">
      {/* Expedition Screen - Full screen overlay */}
      {expeditionScreenId && (
        <ExpeditionScreen 
          expeditionId={expeditionScreenId}
          onExit={handleExitExpedition}
        />
      )}
      
      {/* Main App - Hidden when expedition screen is active */}
      {!expeditionScreenId && (
        <>
          {/* Top Header */}
          <TopHeader />
          
          {/* Main content */}
          <div className={`flex-1 w-full overflow-hidden ${showTabBar ? 'pb-16' : ''}`}>
            {renderContent()}
          </div>
          
          {/* Bottom Tab Bar */}
          {showTabBar && (
            <BottomTabBar activeTab={activeTab} onTabChange={handleTabChange} />
          )}
          
        </>
      )}
    </div>
  )
}

export default App
