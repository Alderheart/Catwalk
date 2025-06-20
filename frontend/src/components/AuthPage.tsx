import { useState } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Game Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Cat Colony</h1>
          <p className="text-gray-400">Manage your feline community</p>
        </div>
        
        {/* Auth Forms */}
        {isLogin ? (
          <LoginForm onSwitchToSignup={() => setIsLogin(false)} />
        ) : (
          <SignupForm onSwitchToLogin={() => setIsLogin(true)} />
        )}
        
        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            Build your colony, manage your cats, explore the world
          </p>
        </div>
      </div>
    </div>
  );
}