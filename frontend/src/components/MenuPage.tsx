import { useAuthStore } from '../stores/authStore';
import { useTabBarStore } from '../stores/tabBarStore';
import { useState } from 'react';

export default function MenuPage() {
  const { user, signout } = useAuthStore();
  const { setActiveTab } = useTabBarStore();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    await signout();
    setShowLogoutModal(false);
  };

  return (
    <div className="h-full w-full overflow-hidden bg-gradient-to-b from-gray-900 to-gray-950 p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-white text-center mb-8">Menu</h1>
        
        {/* User Info */}
        {user && (
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-white mb-2">Account</h2>
            <div className="space-y-1">
              <p className="text-gray-300">
                <span className="text-gray-400">Username:</span> {user.username || 'No username'}
              </p>
              <p className="text-gray-300">
                <span className="text-gray-400">Email:</span> {user.email}
              </p>
            </div>
          </div>
        )}
        
        {/* Menu Options */}
        <div className="space-y-3">
          {/* Admin Panel */}
          <button 
            onClick={() => setActiveTab('admin')}
            className="w-full bg-purple-800 hover:bg-purple-700 text-white p-4 rounded-lg text-left transition-colors duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">Admin Panel</span>
              <span className="text-gray-400">→</span>
            </div>
            <p className="text-sm text-gray-400 mt-1">Create and manage cats</p>
          </button>

          {/* Settings */}
          <button className="w-full bg-gray-800 hover:bg-gray-700 text-white p-4 rounded-lg text-left transition-colors duration-200">
            <div className="flex items-center justify-between">
              <span className="font-medium">Settings</span>
              <span className="text-gray-400">→</span>
            </div>
            <p className="text-sm text-gray-400 mt-1">Game preferences and options</p>
          </button>
          
          {/* About */}
          <button className="w-full bg-gray-800 hover:bg-gray-700 text-white p-4 rounded-lg text-left transition-colors duration-200">
            <div className="flex items-center justify-between">
              <span className="font-medium">About</span>
              <span className="text-gray-400">→</span>
            </div>
            <p className="text-sm text-gray-400 mt-1">Game information and credits</p>
          </button>
          
          {/* Logout */}
          <button 
            onClick={() => setShowLogoutModal(true)}
            className="w-full bg-red-800 hover:bg-red-700 text-white p-4 rounded-lg text-left transition-colors duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">Sign Out</span>
              <span className="text-gray-400">→</span>
            </div>
            <p className="text-sm text-gray-400 mt-1">Log out of your account</p>
          </button>
        </div>
        
        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">Cat Colony v1.0.0</p>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center safe-area-all">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowLogoutModal(false)}
          />
          
          {/* Modal */}
          <div className="relative bg-white rounded-lg shadow-xl border border-gray-200 p-6 m-4 w-full max-w-sm">
            <div className="text-center">
              <div className="mb-4">
                <svg className="w-12 h-12 text-red-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign Out</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to sign out of your account?</p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}