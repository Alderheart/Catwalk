import { useEffect } from 'react'
import Camp from './components/Camp'
import BottomTabBar from './components/BottomTabBar'
import TopHeader from './components/TopHeader'
import CatsList from './components/CatsList'
import AuthPage from './components/AuthPage'
import MenuPage from './components/MenuPage'
import AdminPanel from './components/AdminPanel'
import { useTabBarStore } from './stores/tabBarStore'
import { useAuthStore } from './stores/authStore'

function App() {
  const { activeTab, showTabBar, setActiveTab } = useTabBarStore()
  const { isAuthenticated, isLoading, checkAuthStatus } = useAuthStore()

  // Check auth status on app load
  useEffect(() => {
    checkAuthStatus()
  }, [])

  // Set default tab to camp when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setActiveTab('camp')
    }
  }, [isAuthenticated, setActiveTab])

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'camp':
        return <Camp />
      case 'cats':
        return <CatsList />
      case 'expeditions':
        return (
          <div className="h-full w-full overflow-hidden bg-gradient-to-b from-purple-900 to-purple-950 p-4 flex items-center justify-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center">Expeditions (Coming Soon)</h1>
          </div>
        )
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
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-900">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AuthPage />
  }

  return (
    <div className="relative h-full w-full overflow-hidden flex flex-col">
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
    </div>
  )
}

export default App
