import Camp from './components/Camp'
import BottomTabBar from './components/BottomTabBar'
import TopHeader from './components/TopHeader'
import CatsList from './components/CatsList'
import { useTabBarStore } from './stores/tabBarStore'

function App() {
  const { activeTab, showTabBar, setActiveTab } = useTabBarStore()

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
        return (
          <div className="h-full w-full overflow-hidden bg-gradient-to-b from-gray-900 to-gray-950 p-4 flex items-center justify-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center">Menu (Coming Soon)</h1>
          </div>
        )
      default:
        return <Camp />
    }
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
