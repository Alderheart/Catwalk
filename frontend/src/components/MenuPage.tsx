import { useAuthStore } from '../stores/authStore';

export default function MenuPage() {
  const { user, signout } = useAuthStore();

  const handleLogout = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await signout();
    }
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
            onClick={handleLogout}
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
    </div>
  );
}