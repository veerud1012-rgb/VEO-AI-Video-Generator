import React, { useState } from 'react';
import VideoGenerator from './components/VideoGenerator';
import { VeoLogo } from './components/icons';
import AuthModal from './components/Auth';
import UserProfile from './components/UserProfile';

type AuthMode = 'signIn' | 'signUp';
export interface User {
  name: string;
  email: string;
  picture?: string;
}

interface AuthButtonsProps {
  onSignInClick: () => void;
  onSignUpClick: () => void;
}

const AuthButtons: React.FC<AuthButtonsProps> = ({ onSignInClick, onSignUpClick }) => {
  return (
    <div className="flex items-center gap-4">
      <button
        onClick={onSignInClick}
        className="text-gray-300 hover:text-white font-semibold transition-colors duration-200"
        aria-label="Sign in to your account"
      >
        Sign In
      </button>
      <button
        onClick={onSignUpClick}
        className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-5 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
        aria-label="Create a new account"
      >
        Sign Up
      </button>
    </div>
  );
};


const App: React.FC = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const openAuthModal = () => {
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const handleSignInSuccess = (userData: User) => {
    setUser(userData);
    closeAuthModal();
  };

  const handleSignOut = () => {
    setUser(null);
  };

  return (
    <>
      <div className="relative min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 font-sans">
        <div className="absolute top-6 right-6 z-10">
          {user ? (
            <UserProfile user={user} onSignOut={handleSignOut} />
          ) : (
            <AuthButtons 
              onSignInClick={openAuthModal}
              onSignUpClick={openAuthModal}
            />
          )}
        </div>
        <div className="w-full max-w-3xl mx-auto pt-20">
          <header className="text-center mb-8">
            <div className="flex justify-center items-center gap-4 mb-4">
              <VeoLogo className="h-12 w-12 text-purple-400" />
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-500">
                VEO AI Video Generator
              </h1>
            </div>
            <p className="text-lg text-gray-400">
              Create stunning 10-second videos from text and images with Google's most capable video model.
            </p>
          </header>

          <main>
            <VideoGenerator />
          </main>

          <footer className="text-center mt-12 text-gray-500 text-sm">
            <p>Powered by Google VEO & React</p>
          </footer>
        </div>
      </div>
      {!user && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={closeAuthModal}
          onSignInSuccess={handleSignInSuccess}
        />
      )}
    </>
  );
};

export default App;