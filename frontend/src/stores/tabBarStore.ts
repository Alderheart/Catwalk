import { create } from 'zustand'

interface TabBarState {
  showTabBar: boolean
  activeTab: string
  setShowTabBar: (show: boolean) => void
  setActiveTab: (tabId: string) => void
  hideForMinigame: () => void
  showAfterMinigame: () => void
}

export const useTabBarStore = create<TabBarState>((set) => ({
  showTabBar: true,
  activeTab: 'camp',
  
  setShowTabBar: (show) => set({ showTabBar: show }),
  setActiveTab: (tabId) => set({ activeTab: tabId }),
  
  hideForMinigame: () => set({ showTabBar: false }),
  showAfterMinigame: () => set({ showTabBar: true }),
}))